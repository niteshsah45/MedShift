import express from "express";

import {createHospitalProfile,
    getMyHospital,
    updateMyHospital
} from "../controllers/hospital.controller.js";


import {  verifyToken} from "../middlewares/auth.middleware.js";
import {  allowRoles } from "../middlewares/role.middleware.js";
import {validate} from "../middlewares/validation.middleware.js";
import {createHospitalSchema} from "../validators/hospital.validator.js";



const router = express.Router();


export const updateHospitalSchema =
    createHospitalSchema.fork(
        [
            "hospitalName",
            "address",
            "city",
            "departments"
        ],
        (schema) => schema.optional()
    );

router.post(
    "/",
    verifyToken,
    allowRoles("hospital"),
    validate(createHospitalSchema),
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
    validate(updateHospitalSchema),
    updateMyHospital
);


export default router;