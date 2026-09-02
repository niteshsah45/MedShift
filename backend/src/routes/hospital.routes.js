import express from "express";

import {createHospitalProfile,
    getMyHospital,
    updateMyHospital
} from "../controllers/hospital.controller.js";


import {  verifyToken} from "../middlewares/auth.middleware.js";


import {  allowRoles } from "../middlewares/role.middleware.js";



const router = express.Router();


router.post(
    "/",
    verifyToken,
    allowRoles("hospital"),
    createHospitalProfile
);

router.get(
    "/me",
    verifyToken,
    allowRoles("hospital"),
    getMyHospital
);

router.patch(
    "/me",
    verifyToken,
    allowRoles("hospital"),
    updateMyHospital
);


export default router;