import Joi from "joi";

export const requestIdSchema = Joi.object({
    requestId: Joi.string()
        .hex()
        .length(24)
        .required()
});

export const applicationIdSchema = Joi.object({
    applicationId: Joi.string()
        .hex()
        .length(24)
        .required()
});