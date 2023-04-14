
import express, { json } from 'express';
import cors from "cors";
import { MongoClient } from "mongodb";
import dayjs from "dayjs";
import dotenv from "dotenv";
import Joi from "joi";
import { stripHtml } from "string-strip-html";

const app = express();
app.use(cors());
app.use(json());

dotenv.config();

const PORT = 5000;


const mydatabase = process.env.DATABASE_URL;

const mongoClient = new MongoClient(mydatabase);
try {

  await mongoClient.connect();

} catch (error) {

}

const db = mongoClient.db();

const participantConfig = Joi.object({

    name: Joi.string().min(1).required(),

  });
    
  function stringConfig(parameterString) {

    return stripHtml(parameterString).result.trim();

  }

  function objConfig(parametrObj) {

    const constructorConfig = Object.keys(parametrObj);

    constructorConfig.forEach((key) => {

      if (typeof parametrObj[key] === "string")
      parametrObj[key] = stringConfig(parametrObj[key]);

    });

    return parametrObj;

  }
  


async function chatentry(participant) {

  const { failedEntry, personalUser } = participantConfig.validate(participant);

  if (failedEntry) {

    return { code: 422 };

  }

  objConfig(personalUser);

  try {

    const changeUser = await db.collection("participants").findOne({ name: personalUser.name });

    if (changeUser) return { code: 409 };

    await db.collection("participants").insertOne({ ...personalUser, lastStatus: Date.now() });

    await db.collection("messages").insertOne({

      from: personalUser.name,
      to: "Todos",
      text: "entra na sala...",
      type: "status",
      time: dayjs().format("HH:mm:ss"),

    });

    return { code: 201};

   } catch (error) {

  }
}

app.post("/participants", async (req, res) => {

    const username = req.body;
    const chatStatus = await db.chatentry(username);
    return res.status(chatStatus.code).send(chatStatus.message);

  });


  app.listen(PORT, () => console.log(`HI, I'TS ME!!!`));
  

