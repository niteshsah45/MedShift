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

export const mongoIdSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

export const requestIdSchema = Joi.object({
  requestId: Joi.string().hex().length(24).required(),
});

export const applicationIdSchema = Joi.object({
  applicationId: Joi.string().hex().length(24).required(),
});

export const assignmentIdSchema = Joi.object({
  assignmentId: Joi.string().hex().length(24).required(),
});

export const documentIdSchema = Joi.object({
  documentId: Joi.string().hex().length(24).required(),
});

export const hospitalIdSchema = Joi.object({
  hospitalId: Joi.string().hex().length(24).required(),
});

export const paginationSchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(50)
        .default(10)
});