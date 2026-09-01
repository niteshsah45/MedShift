import Professional from "../models/professional.model.js";

import {
    uploadVerificationDocumentService
} from "../services/verification.service.js";


export const uploadVerificationDocument = async (
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
            await uploadVerificationDocumentService(
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