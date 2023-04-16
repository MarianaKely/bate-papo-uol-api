
import Joi from "joi";


const userSchema = Joi.object({

    name: Joi.string().required(),

  });

  const messageSchema = Joi.object({

    to: Joi.string().required(),
    text: Joi.string().required(),
    type: Joi.string().valid("private_message", "message").required(),
    
  });

  export { userSchema , messageSchema };