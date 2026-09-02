import express from "express";

import { applyToRequest,
    getApplicationsForHospital_Request,
    acceptApplication,
    rejectApplication
} from "../controllers/application.controller.js";

import { requireApprovedProfessional ,
    requireApprovedHospital
} from "../middlewares/verification.middleware.js";


import { verifyToken} from "../middlewares/auth.middleware.js";


import {allowRoles} from "../middlewares/role.middleware.js";

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
    requireApprovedHospital,
    acceptApplication
);
router.patch(
    "/:applicationId/reject",
    verifyToken,
    allowRoles("hospital"),
    requireApprovedHospital,
    rejectApplication
)

export default router;