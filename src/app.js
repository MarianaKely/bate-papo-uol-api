

import { MongoClient } from "mongodb";
import express, { json } from 'express';
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



  const PORT = 5000;

  app.listen(PORT, () => { console.log(`HI, ITS ME!!!`);
  
});

}

uolAPi();