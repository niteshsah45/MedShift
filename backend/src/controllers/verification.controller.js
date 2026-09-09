import Professional from "../models/professional.model.js";


import {
    uploadProfessionalVerificationDocumentService,
    getProfessionalPendingVerificationsService,
    approveProfessionalVerificationService,
    rejectProfessionalVerificationService,
    getPendingHospitalsVerificationService,
    approveHospitalVerificationService,
    rejectHospitalVerificationService       
} from "../services/verification.service.js";


export const uploadProfessionalVerificationDocument = async (
    req,
    res
) => {

    try {

        const professional =
            await Professional.findOne({
                userId: req.user.id
            });

        if (!professional) {

            return res.status(404).json({
                success: false,
                message: "Professional profile not found"
            });

        }

        const { documentType } = req.body;

        const document =
            await uploadProfessionalVerificationDocumentService(
                professional._id,
                req.file,
                documentType
            );

        res.status(201).json({

            success: true,

            data: document,

            message:
                "Verification document uploaded successfully"

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }
};

// Admin: get pending verifications

export const getPendingProfessionalVerifications = async (req, res) => {

    try {

        const documents =
            await getProfessionalPendingVerificationsService();

        res.status(200).json({

            success: true,

            data: documents

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }
};


// Admin: approve

export const approveProfessionalVerification = async (req, res) => {

    try {

        const { documentId } = req.params;

        const result =
            await approveProfessionalVerificationService(
                documentId
            );

        res.status(200).json({

            success: true,

            data: result,

            message:
                "Professional verification approved"

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }
};


// Admin: reject

export const rejectProfessionalVerification = async (req, res) => {

    try {

        const { documentId } = req.params;

        const { reason } = req.body;

        if (!reason) {

            return res.status(400).json({

                success: false,

                message:
                    "Rejection reason is required"

            });

        }

        const result =
            await rejectProfessionalVerificationService(
                documentId,
                reason
            );

        res.status(200).json({

            success: true,

            data: result,

            message:
                "Professional verification rejected"

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }
};

export const getPendingHospitalVerifications = async (req, res) => {

    try {

        const hospitals = await getPendingHospitalsVerificationService();

        res.status(200).json({
            success: true,
            data: hospitals
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const approveHospitalVerification = async (req, res) => {

    try {

        const hospital = await approveHospitalVerificationService(
            req.params.hospitalId
        );

        res.status(200).json({
            success: true,
            message: "Hospital approved successfully",
            data: hospital
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


export const rejectHospitalVerification = async (req, res) => {

    try {

        const hospital = await rejectHospitalVerificationService(
            req.params.hospitalId
        );

        res.status(200).json({
            success: true,
            message: "Hospital rejected successfully",
            data: hospital
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};