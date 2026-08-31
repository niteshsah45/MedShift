import express from 'express';
import {getMyAssignments,getHospitalAssignments,completeAssignment,
    cancelAssignmentByProfessional,
    cancelAssignmentByHospital,
} from '../controllers/assignment.controller.js';

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

router.patch(
    "/:assignmentId/cancel-by-professional",
    verifyToken,
    allowRoles("professional"),
    cancelAssignmentByProfessional
)
router.patch(
    "/:assignmentId/cancel-by-hospital",
    verifyToken,
    allowRoles("hospital"),
    cancelAssignmentByHospital
)

export default router;
