import express from "express";

import { createRequest,getAvailableRequests,
    closeStaffingRequest,
    reopenStaffingRequest,
    getMyRequestsForHospital
} from "../controllers/request.controller.js";


import {   verifyToken} from "../middlewares/auth.middleware.js";

import {    allowRoles } from "../middlewares/role.middleware.js";
import { requireApprovedHospital } from "../middlewares/verification.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { createRequestSchema } from "../validators/request.validator.js";

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
router.patch(
    "/:requestId/reopen",
    verifyToken,
    allowRoles("hospital"),
    requireApprovedHospital,
    reopenStaffingRequest
);


router.get(
    "/my",
    verifyToken,
    allowRoles("hospital"),
    getMyRequestsForHospital
)




export default router;