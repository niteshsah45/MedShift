import express from 'express';
import {getMyAssignments,getHospitalAssignments,completeAssignment,
    cancelAssignmentByProfessional,
    cancelAssignmentByHospital,
} from '../controllers/assignment.controller.js';

import {verifyToken} from '../middlewares/auth.middleware.js';
import {allowRoles} from '../middlewares/role.middleware.js';
import {requireApprovedProfessional,requireApprovedHospital} from '../middlewares/verification.middleware.js';
import {validate} from '../middlewares/validation.middleware.js';
import {assignmentIdSchema} from '../validations/assignment.validator.js';

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
    validate(assignmentIdSchema,"params"),
    completeAssignment  
)

router.patch(
    "/:assignmentId/cancel-by-professional",
    verifyToken,
    allowRoles("professional"),
    requireApprovedProfessional,
    validate(assignmentIdSchema,"params"),
    cancelAssignmentByProfessional
)
router.patch(
    "/:assignmentId/cancel-by-hospital",
    verifyToken,
    allowRoles("hospital"),
    requireApprovedHospital,
    validate(assignmentIdSchema,"params"),
    cancelAssignmentByHospital
)

export default router;
