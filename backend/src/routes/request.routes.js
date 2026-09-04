import express from "express";

import { createRequest,getAvailableRequests,
    closeStaffingRequest,
    getMyRequestsForHospital
} from "../controllers/request.controller.js";


import {   verifyToken} from "../middlewares/auth.middleware.js";

import {    allowRoles } from "../middlewares/role.middleware.js";
import { requireApprovedHospital } from "../middlewares/verification.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { createRequestSchema } from "../validations/request.validation.js";

const router = express.Router();


router.post(
    "/",
    verifyToken,
    allowRoles("hospital"),
    requireApprovedHospital,
    validate(createRequestSchema),
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

router.get(
    "/my",
    verifyToken,
    allowRoles("hospital"),
    getMyRequestsForHospital
)




export default router;