

import express, { json } from 'express';
import cors from "cors";
import dotenv from "dotenv";
import * as db from "./configurations.js";


dotenv.config();

const app = express();
app.use(cors());
app.use(json());



app.post("/participants", async (req, res) => {

  const participant = req.body;
  const chatStatus = await db.chatEntry(participant);
  return res.status(chatStatus.code).send(chatStatus.message);

});

app.get("/participants", async (req, res) => {

  const theParticipants = await db.chatParticipants();
  res.status(theParticipants.code).send(theParticipants.data);

});



const PORT = 5000;

app.listen(PORT, () => console.log(`HI, ITS ME!!!`));