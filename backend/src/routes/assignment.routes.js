import express from 'express';
import {getMyAssignments,getHospitalAssignments,completeAssignment} from '../controllers/assignment.controller.js';

import {verifyToken} from '../middlewares/auth.middleware.js';
import {allowRoles} from '../middlewares/role.middleware.js';

const router = express.Router();

router.get(
    "/my",
    verifyToken,
    allowRoles("professional"),
    getMyAssignments
);

router.get(
    "/hospital",
    verifyToken,
    allowRoles("hospital"),
    getHospitalAssignments
)

router.patch(
    "/:assignmentId/complete",
    verifyToken,
    allowRoles("hospital"),
    completeAssignment  
)

export default router;
