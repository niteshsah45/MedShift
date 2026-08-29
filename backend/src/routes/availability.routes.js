import express from "express";

import {
    createAvailability
} from "../controllers/availability.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post(
    "/",
    verifyToken,
    allowRoles("professional"),
    createAvailability
);

export default router;