import express from "express";

import {
    uploadVerificationDocument
} from "../controllers/verification.controller.js";

import upload from "../middlewares/upload.middleware.js";

import { verifyToken } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post(
    "/documents",
    verifyToken,
    allowRoles("professional"),
    upload.single("document"),
    uploadVerificationDocument
);

export default router;