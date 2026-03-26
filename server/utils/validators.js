import Joi from "joi";
import "colors";

export const registerSchema = Joi.object({
  nom:          Joi.string().min(2).max(100).required()
                  .messages({ "string.min": "Le nom doit faire au moins 2 caractères." }),
  email:        Joi.string().email().required()
                  .messages({ "string.email": "Email invalide." }),
  mot_de_passe: Joi.string().min(8).max(100).required()
                  .messages({ "string.min": "Le mot de passe doit faire au moins 8 caractères." }),
});

export const loginSchema = Joi.object({
  email:        Joi.string().email().required(),
  mot_de_passe: Joi.string().required(),
});

export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map(d => d.message);
    console.log("[VALIDATION ERROR]".red.bold, messages[0].yellow);
    return res.status(400).json({ error: messages[0], errors: messages });
  }
  next();
};
