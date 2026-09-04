import Joi from "joi";

export const registerSchema = Joi.object({

    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required(),

    password: Joi.string()
        .min(6)
        .max(100)
        .required(),

    role: Joi.string()
        .valid("hospital", "professional")
        .required()

});

export const loginSchema = Joi.object({

    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required(),

    password: Joi.string()
        .required()

});