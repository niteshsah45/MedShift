import cloudinary from "../config/cloudinary.js";
import VerificationDocument from "../models/verification.model.js";
import Professional from "../models/professional.model.js";
import { createNotification } from "./notification.service.js";

export const uploadProfessionalVerificationDocumentService = async (
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

// Get pending verification documents
export const getProfessionalPendingVerificationsService = async () => {

    return await VerificationDocument.find({
        status: "PENDING"
    })
    .populate(
        "professionalId",
        "name specialization experienceYears city verificationStatus"
    );
};


// Approve verification document
export const approveProfessionalVerificationService = async (documentId) => {

    const document =
        await VerificationDocument.findById(documentId);

    if (!document) {
        throw new Error("Verification document not found");
    }

    if (document.status !== "PENDING") {
        throw new Error("Document already processed");
    }

    document.status = "APPROVED";

    await document.save();


    const professional =
        await Professional.findById(
            document.professionalId
        );

    if (!professional) {
        throw new Error("Professional profile not found");
    }


    // For simple version:
    // approving the document makes professional verified

    professional.verificationStatus = "APPROVED";

    await professional.save();


    await createNotification({

        userId: professional.userId,

        type: "VERIFICATION_APPROVED",

        title: "Verification Approved",

        message:
            "Your professional profile has been verified. You can now apply for staffing requests.",

        relatedId: professional._id

    });


    return {
        document,
        professional
    };
};


// Reject verification document
export const rejectProfessionalVerificationService = async (
    documentId,
    reason
) => {

    const document =
        await VerificationDocument.findById(documentId);

    if (!document) {
        throw new Error("Verification document not found");
    }

    if (document.status !== "PENDING") {
        throw new Error("Document already processed");
    }


    document.status = "REJECTED";

    document.rejectionReason = reason;

    await document.save();


    const professional =
        await Professional.findById(
            document.professionalId
        );

    if (!professional) {
        throw new Error("Professional profile not found");
    }


    professional.verificationStatus = "REJECTED";

    await professional.save();


    await createNotification({

        userId: professional.userId,

        type: "VERIFICATION_REJECTED",

        title: "Verification Rejected",

        message:
            `Your verification document was rejected. Reason: ${reason}`,

        relatedId: professional._id

    });


    return {
        document,
        professional
    };
};

// hospital side verification service
import Hospital from "../models/hospital.model.js";

export const getPendingHospitalsVerificationsService = async () => {
    return await Hospital.find({
        verificationStatus: "PENDING"
    }).populate("userId", "email");
};

export const approveHospitalVerificationService = async (hospitalId) => {

    const hospital = await Hospital.findById(hospitalId);

    if (!hospital) {
        throw new Error("Hospital not found");
    }

    if (hospital.verificationStatus !== "PENDING") {
        throw new Error("Hospital is already processed");
    }

    hospital.verificationStatus = "APPROVED";

    await hospital.save();

    await createNotification({
        userId: hospital.userId,
        type: "VERIFICATION_APPROVED",
        title: "Hospital Verified",
        message: "Your hospital has been verified. You can now create staffing requests."
    });

    return hospital;
};

export const rejectHospitalVerificationService = async (hospitalId) => {

    const hospital = await Hospital.findById(hospitalId);

    if (!hospital) {
        throw new Error("Hospital not found");
    }

    if (hospital.verificationStatus !== "PENDING") {
        throw new Error("Hospital is already processed");
    }

    hospital.verificationStatus = "REJECTED";

    await hospital.save();

    await createNotification({
        userId: hospital.userId,
        type: "VERIFICATION_REJECTED",
        title: "Hospital Verification Rejected",
        message: "Your hospital verification was rejected."
    });

    return hospital;
};