import express from 'express';
import {getMyAssignments,getHospitalAssignments} from '../controllers/assignment.controller.js';

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

export default router;
