import express from "express";

import { applyToRequest,
    getApplicationsForHospital_Request,
    acceptApplication,
    rejectApplication,
    getMyApplicationsForProfessional
} from "../controllers/application.controller.js";

import { requireApprovedProfessional ,
    requireApprovedHospital
} from "../middlewares/verification.middleware.js";


import { verifyToken} from "../middlewares/auth.middleware.js";


import {allowRoles} from "../middlewares/role.middleware.js";

import {validate} from "../middlewares/validation.middleware.js";
import {requestIdSchema,
    applicationIdSchema
} from "../validations/application.validator.js";

const router = express.Router();

router.get("/test", (req,res)=>{
    res.json({
        message:"application routes working"
    });
});


router.post(
    "/requests/:requestId/apply",
    verifyToken,
    allowRoles("professional"),
    requireApprovedProfessional,
    validate(requestIdSchema,"params"),
    applyToRequest
);

router.get(
    "/requests/:requestId/applications",
    (req,res,next)=>{

        console.log("APPLICATION VIEW ROUTE HIT");

        next();
    },
    verifyToken,
    allowRoles("hospital"),
    requireApprovedHospital,
    getApplicationsForHospital_Request
);
router.patch(
    "/:applicationId/accept",
    verifyToken,
    allowRoles("hospital"),
    validate(applicationIdSchema,"params"),
    requireApprovedHospital,
    acceptApplication
);
router.patch(
    "/:applicationId/reject",
    verifyToken,
    allowRoles("hospital"),
    validate(applicationIdSchema,"params"),
    requireApprovedHospital,
    rejectApplication
)

// get all the applications for a particular professional
router.get(
    "/my",
    verifyToken,
    allowRoles("professional"),
    getMyApplicationsForProfessional
);

export default router;