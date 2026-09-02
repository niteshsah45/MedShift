import express from "express";

import upload from "../middlewares/upload.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

import {
    uploadProfessionalVerificationDocument,
    getPendingProfessionalVerifications,
    approveProfessionalVerification,
    rejectProfessionalVerification,

    getPendingHospitalVerifications,
    approveHospitalVerification,
    rejectHospitalVerification
} from "../controllers/verification.controller.js";

const router = express.Router();


// Professional uploads verification document
router.post(
    "/professional/documents",
    verifyToken,
    allowRoles("professional"),
    upload.single("document"),
    uploadProfessionalVerificationDocument
);

// Admin gets pending professional verifications
router.get(
    "/professional/pending",
    verifyToken,
    allowRoles("admin"),
    getPendingProfessionalVerifications
);

// Admin approves professional document
router.patch(
    "/professional/:documentId/approve",
    verifyToken,
    allowRoles("admin"),
    approveProfessionalVerification
);

// Admin rejects professional document
router.patch(
    "/professional/:documentId/reject",
    verifyToken,
    allowRoles("admin"),
    rejectProfessionalVerification
);


// Admin gets pending hospital verifications
router.get(
    "/hospital/pending",
    verifyToken,
    allowRoles("admin"),
    getPendingHospitalVerifications
);

// Admin approves hospital
router.patch(
    "/hospital/:hospitalId/approve",
    verifyToken,
    allowRoles("admin"),
    approveHospitalVerification
);

// Admin rejects hospital
router.patch(
    "/hospital/:hospitalId/reject",
    verifyToken,
    allowRoles("admin"),
    rejectHospitalVerification
);


export default router;