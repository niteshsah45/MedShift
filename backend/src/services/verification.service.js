import cloudinary from "../config/cloudinary.js";
import VerificationDocument from "../models/verificationDocument.model.js";

export const uploadVerificationDocumentService = async (
    professionalId,
    file,
    documentType) => {


        const existing =
            await VerificationDocument.findOne({
                professionalId,
                documentType,
                status: "PENDING"
            });

        if (existing) {
            throw new Error(
                "This document is already under verification"
            );
        }

    if (!file) {
        throw new Error("Document file is required");
    }

    const allowedTypes = [
        "DEGREE",
        "MEDICAL_LICENSE",
        "EXPERIENCE_CERTIFICATE",
        "IDENTITY"
    ];

    if (!allowedTypes.includes(documentType)) {
        throw new Error("Invalid document type");
    }

    // Upload buffer to Cloudinary

    const result = await new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "medshift/professionals",
                resource_type: "auto"
            },

            (error, result) => {

                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }

            }
        );

        stream.end(file.buffer);
    });

    // Save document information in MongoDB

    const document =
        await VerificationDocument.create({

            professionalId,

            documentType,

            fileUrl: result.secure_url,

            publicId: result.public_id,

            status: "PENDING"

        });

    return document;
};