import Joi from "joi";
export const notificationIdSchema = Joi.object({

    notificationId: Joi.string()
        .hex()
        .length(24)
        .required()

});