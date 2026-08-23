import express from "express";

import {createProfessionalProfile} from "../controllers/professional.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";

import { allowRoles} from "../middlewares/role.middleware.js";


const router = express.Router();


router.post(
    "/",
    verifyToken,
    allowRoles("professional"),
    createProfessionalProfile
);
export default router;