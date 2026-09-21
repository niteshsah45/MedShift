import express from "express";

import { verifyToken } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

import { getAdminDashboard } from "../controllers/admin.controller.js";

const router = express.Router();

router.get(
    "/dashboard",
    verifyToken,
    allowRoles("admin"),
    getAdminDashboard
);

export default router;