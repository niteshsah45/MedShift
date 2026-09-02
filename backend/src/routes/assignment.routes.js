import express from 'express';
import {getMyAssignments,getHospitalAssignments,completeAssignment,
    cancelAssignmentByProfessional,
    cancelAssignmentByHospital,
} from '../controllers/assignment.controller.js';

import {verifyToken} from '../middlewares/auth.middleware.js';
import {allowRoles} from '../middlewares/role.middleware.js';
import {requireApprovedProfessional,requireApprovedHospital} from '../middlewares/verification.middleware.js';

const router = express.Router();

router.get(
    "/my",
    verifyToken,
    allowRoles("professional"),
    requireApprovedProfessional,
    getMyAssignments
);

router.get(
    "/hospital",
    verifyToken,
    allowRoles("hospital"),
    requireApprovedHospital,
    getHospitalAssignments
)

router.patch(
    "/:assignmentId/complete",
    verifyToken,
    allowRoles("hospital"),
    requireApprovedHospital,
    completeAssignment  
)

router.patch(
    "/:assignmentId/cancel-by-professional",
    verifyToken,
    allowRoles("professional"),
    requireApprovedProfessional,
    cancelAssignmentByProfessional
)
router.patch(
    "/:assignmentId/cancel-by-hospital",
    verifyToken,
    allowRoles("hospital"),
    requireApprovedHospital,
    cancelAssignmentByHospital
)

export default router;
