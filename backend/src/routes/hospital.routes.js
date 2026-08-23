import express from "express";

import {createHospitalProfile} from "../controllers/hospital.controller.js";


import {  verifyToken} from "../middlewares/auth.middleware.js";


import {  allowRoles } from "../middlewares/role.middleware.js";


const router = express.Router();


router.post(
    "/",
    verifyToken,
    allowRoles("hospital"),
    createHospitalProfile
);


export default router;