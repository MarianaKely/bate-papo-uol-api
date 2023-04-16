

import { MongoClient } from "mongodb";
import express, { json } from 'express';
import cors from "cors";
import dayjs from "dayjs";
import dotenv from "dotenv";
import { userSchema } from "./configurations.js";

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



  const PORT = 5000;

  app.listen(PORT, () => { console.log(`HI, ITS ME!!!`);

});

}

uolAPi();