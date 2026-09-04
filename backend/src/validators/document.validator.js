import Joi from "joi";

export const uploadDocumentSchema = Joi.object({

    documentType: Joi.string()
        .valid(
            "DEGREE",
            "MEDICAL_LICENSE",
            "EXPERIENCE_CERTIFICATE",
            "IDENTITY"
        )
        .required()

});

export const verificationDocumentIdSchema = Joi.object({
    documentId: Joi.string()
        .hex()
        .length(24)
        .required()
});

export const verificationHospitalIdSchema = Joi.object({
    hospitalId: Joi.string()
        .hex()
        .length(24)
        .required()
});