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
import { createRequestSchema ,requestIdSchema} from "../validators/request.validator.js";


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
    validate(paginationSchema, "query"),
    getAvailableRequests
);
router.patch(
    "/:requestId/close",
    verifyToken,
    allowRoles("hospital"),
    validate(requestIdSchema, "params"),
    requireApprovedHospital,
    closeStaffingRequest
);
router.patch(
    "/:requestId/reopen",
    verifyToken,
    allowRoles("hospital"),
    validate(requestIdSchema, "params"),
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