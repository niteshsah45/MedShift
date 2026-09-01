import mongoose from "mongoose";

const verificationDocumentSchema = new mongoose.Schema(
    {
        professionalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Professional",
            required: true
        },

        documentType: {
            type: String,

            enum: [
                "DEGREE",
                "MEDICAL_LICENSE",
                "EXPERIENCE_CERTIFICATE",
                "IDENTITY"
            ],

            required: true
        },

        fileUrl: {
            type: String,
            required: true
        },

        publicId: {
            type: String,
            required: true
        },

        status: {
            type: String,

            enum: [
                "PENDING",
                "APPROVED",
                "REJECTED"
            ],

            default: "PENDING"
        },

        rejectionReason: {
            type: String
        }
    },

    {
        timestamps: true
    }
);

export default mongoose.model(
    "VerificationDocument",
    verificationDocumentSchema
);