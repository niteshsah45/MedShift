import express from "express";

import { createRequest,getAvailableRequests,
    closeStaffingRequest 
} from "../controllers/request.controller.js";


import {   verifyToken} from "../middlewares/auth.middleware.js";

import {    allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();


router.post(
    "/",
    verifyToken,
    allowRoles("hospital"),
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
    closeStaffingRequest
);


export default router;