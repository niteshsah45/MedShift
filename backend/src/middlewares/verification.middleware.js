import Professional from "../models/professional.model.js";

export const requireApprovedProfessional = async (req, res, next) => {
    try {
        const professional = await Professional.findOne({
            userId: req.user.id
        });

        if (!professional) {
            return res.status(404).json({
                success: false,
                message: "Professional profile not found"
            });
        }

        if (professional.verificationStatus !== "APPROVED") {
            return res.status(403).json({
                success: false,
                message: "Professional verification is required"
            });
        }

        req.professional = professional;

        next();

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const requireApprovedHospital = async (req, res, next) => {
    try {
        const hospital = await Hospital.findOne({
            userId: req.user.id
        });

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital profile not found"
            });
        }

        if (hospital.verificationStatus !== "APPROVED") {
            return res.status(403).json({
                success: false,
                message: "Hospital verification is required"
            });
        }

        req.hospital = hospital;

        next();

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};