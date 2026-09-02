import express from "express";

import { createRequest,getAvailableRequests,
    closeStaffingRequest 
} from "../controllers/request.controller.js";


import {   verifyToken} from "../middlewares/auth.middleware.js";

import {    allowRoles } from "../middlewares/role.middleware.js";
import { requireApprovedHospital } from "../middlewares/verification.middleware.js";

const router = express.Router();


router.post(
    "/",
    verifyToken,
    allowRoles("hospital"),
    requireApprovedHospital,
    createRequest
);

router.get(
    "/",
    verifyToken,
    getAvailableRequests
);
router.patch(
    "/:requestId/close",
    verifyToken,
    allowRoles("hospital"),
    requireApprovedHospital,
    closeStaffingRequest
);


export default router;