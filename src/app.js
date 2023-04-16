

import { MongoClient } from "mongodb";
import express, { json , query } from 'express';
import cors from "cors";
import dayjs from "dayjs";
import dotenv from "dotenv";
import { userSchema , messageSchema } from "./configurations.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(json());


const mongoClient = new MongoClient(process.env.DATABASE_URL);
const db = mongoClient.db();



async function uolAPi() {

  try {

    await mongoClient.connect();
    
  } catch (error) {
    
  }

  // members


  app.post("/participants", async (req, res) => {

    const { name } = req.body;
    const chatEntry = userSchema.validate({ name });
    const lastStatus = Date.now();

    if (chatEntry.error) {
      return res.status(422).send("ERROR");

    }

    try {

      const changeUser = await db.collection("participants").findOne({ name: name });

      if (changeUser) {

        return res.status(409).send("ERROR");

      }

      await db.collection("participants").insertOne({ name, lastStatus });
      await db.collection("messages").insertOne({

        from: name,
        to: "Todos",
        text: "entra na sala...",
        type: "status",
        time: dayjs().format("hh:mm:ss"),

      });

      res.sendStatus(201);
      
    } catch (error) {
      
      res.status(500).send("ERROR");

    }
  });


  app.get("/participants", async (_, res) => {

    const participant = await db.collection("participants").find().toArray();
    res.send(participant);

  });


  // Status online/offline


  app.post("/status", async (req, res) => {

    const { user } = req.headers;
    const onlineOffline = await db.collection("participants").findOne({ name: user });

    try {

      if (onlineOffline) {

        await db.collection("participants").updateOne({ name: user }, { $set: { lastStatus: Date.now() } });
        return  res.sendStatus(200);

      }

      if (!onlineOffline) {

        res.sendStatus(404);

      }
    } catch (error) {

    }
  });


  // messages

  app.post("/messages", async (req, res) => {

    const { to, text, type } = req.body;
    const from = req.headers.user;
    const time = dayjs(Date.now()).format("hh:mm:ss");
    const keys = messageSchema.validate({ to, text, type });

    if (keys.error) {

      return res.status(422).send("ERROR");

    }

    const personalUser = await db.collection("participants").countDocuments({ name: from });

    if (personalUser === 0) {

      return res.status(422).send("ERROR");

    }

    try {

      await db.collection("messages").insertOne({

        to,
        text,
        type,
        from,
        time,

      });

      
      res.sendStatus(201);

    } catch (error) {
     
      res.status(422).send("ERROR");

    }
  });


  app.get("/messages", async (req, res) => {

    const { mainProfile } = req.headers;
    const { query } = req;
    const chatConversation = await db.collection("messages").find().toArray();
  
    let mychatConversation = chatConversation.filter(
  
      (chat) => chat.user === mainProfile || chat.to === "Todos" || chat.from === mainProfile ||chat.to === mainProfile ||chat.type === "status"
  
    );
  
    try {
      
      if (

        query && query.limit && (Number(query.limit) < 1 || isNaN(Number(query.limit)))
  
      ) {
  
        res.status(422).send("ERROR");
        return;
  
      } if (query.limit) {
  
        res.status(200).send(mychatConversation.splice(-query.limit).reverse());
  
      } else {
  
        res.status(200).send(mychatConversation);
  
      }
  
    } catch (error) {
  
    }
  });


  // remove members


  setInterval(async function offlineMembers() {

    const removeMembers = await db.collection("participants").find({ lastStatus: { $lt: Date.now() - 10 * 1000 } }).toArray();

    if (removeMembers.length !== 0) {

      removeMembers.forEach(async (user) => {

        await db.collection("participants").deleteOne({ name: user.name });
        await db.collection("messages").insertOne({

          from: user.name,
          to: "Todos",
          text: "sai da sala...",
          type: "status",
          time: dayjs(Date.now()).format("hh:mm:ss"),

        });
      });
    }
  }, 15 * 1000);



  const PORT = 5000;

  app.listen(PORT, () => { console.log(`HI, ITS ME!!!`);
  
});

}

uolAPi();