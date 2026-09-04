import Joi from "joi";

export const createRequestSchema = Joi.object({

    department: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),

    requiredRole: Joi.string()
        .trim()
        .valid("doctor", "nurse")
        .required(),

    specialization: Joi.string()
        .trim()
        .max(100)
        .allow("", null),

    requiredExperience: Joi.number()
        .integer()
        .min(0)
        .required(),

    startAt: Joi.date()
        .iso()
        .required(),

    endAt: Joi.date()
        .iso()
        .greater(Joi.ref("startAt"))
        .required(),

    pay: Joi.number()
        .min(0)
        .required(),

    positions: Joi.number()
        .integer()
        .min(1)
        .required(),

    location: Joi.string()
        .trim()
        .min(2)
        .max(200)
        .required()

});