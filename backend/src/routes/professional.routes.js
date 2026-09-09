import express from "express";

import {createProfessionalProfile,
    getMyProfessional,
    updateMyProfessional
} from "../controllers/professional.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";

import { allowRoles} from "../middlewares/role.middleware.js";
import {validate} from "../middlewares/validation.middleware.js";
import {createProfessionalSchema} from "../validators/professional.validator.js";


const router = express.Router();

export const updateProfessionalSchema =
    createProfessionalSchema.fork(
        [
            "name",
            "role",
            "specialization",
            "experienceYears",
            "qualifications",
            "city"
        ],
        (schema) => schema.optional()
    );


router.post(
    "/",
    verifyToken,
    allowRoles("professional"),
    validate(createProfessionalSchema),
    createProfessionalProfile
);
export default router;

router.get(
    "/me",
    verifyToken,
    allowRoles("professional"),
    getMyProfessional
);

router.patch(
    "/me",
    verifyToken,
    allowRoles("professional"),
    validate(updateProfessionalSchema),
    updateMyProfessional
);