import Joi from "joi";

export const createHospitalSchema = Joi.object({

    hospitalName: Joi.string()
        .trim()
        .min(2)
        .max(150)
        .required(),

    address: Joi.string()
        .trim()
        .min(5)
        .max(300)
        .required(),

    city: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),

    departments: Joi.array()
        .items(
            Joi.string()
                .trim()
                .min(2)
                .max(100)
        )
        .min(1)
        .required()

});