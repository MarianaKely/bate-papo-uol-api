


import Joi from "joi";
import { stripHtml } from "string-strip-html";
import { MongoClient } from "mongodb";
import dayjs from "dayjs";
import dotenv from "dotenv";



dotenv.config();


const mongoClient = new MongoClient(process.env.DATABASE_URL);
const db = mongoClient.db();

try {

  await mongoClient.connect();

} catch (error) {

}




const participantConfig = Joi.object({

  name: Joi.string().min(1).required(),

});

const sendConfig = Joi.object({

  to: Joi.string().min(1).required(),
  text: Joi.string().min(1).required(),
  type: Joi.string().valid("private_message", "message").required(),

});

function stringConfig(parameterString) {

  return stripHtml(parameterString).result.trim();

}
function objConfig(parameterObj) {

  const messageString = Object.keys(parameterObj);
  messageString.forEach((username) => {

    if (typeof parameterObj[username] === "string")
    parameterObj[username] = stringConfig(parameterObj[username]);

  });

  return parameterObj;
  
}



async function chatEntry(participant) {

  const { error, personalUser } = participantConfig.validate(participant);

  if (error) {
    
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

    return { code: 201 };

  } catch (error) {


  }
}

export { chatEntry };