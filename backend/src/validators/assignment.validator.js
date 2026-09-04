export const assignmentIdSchema = Joi.object({

    assignmentId: Joi.string()
        .hex()
        .length(24)
        .required()

});