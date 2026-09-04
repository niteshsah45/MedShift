import Joi from "joi";

export const createProfessionalSchema = Joi.object({

    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),

    role: Joi.string()
        .valid("doctor", "nurse")
        .required(),

    specialization: Joi.string()
        .trim()
        .max(100)
        .allow("", null),

    experienceYears: Joi.number()
        .integer()
        .min(0)
        .required(),

    qualifications: Joi.array()
        .items(
            Joi.string()
                .trim()
                .min(2)
                .max(150)
        )
        .min(1)
        .required(),

    city: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()

});