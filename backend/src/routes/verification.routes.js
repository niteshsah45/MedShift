import express from "express";

import upload from "../middlewares/upload.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

import {
    uploadProfessionalVerificationDocument,
    getMyProfessionalVerifications,
    getPendingProfessionalVerifications,
    approveProfessionalVerification,
    rejectProfessionalVerification,

    getPendingHospitalVerifications,
    approveHospitalVerification,
    rejectHospitalVerification
} from "../controllers/verification.controller.js";

const router = express.Router();


//professional

// Professional uploads verification document
router.post(
    "/professional/documents",
    verifyToken,
    allowRoles("professional"),
    upload.single("document"),
    uploadProfessionalVerificationDocument
);

// Professional sees ONLY their own verification documents
router.get(
    "/professional/my",
    verifyToken,
    allowRoles("professional"),
    getMyProfessionalVerifications
);


//admin verification

// Admin sees ALL pending professional documents
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

// ADMIN - HOSPITAL VERIFICATION

// Admin sees ALL pending hospitals
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