import express from "express";

import { createRequest} from "../controllers/request.controller.js";


import {   verifyToken} from "../middlewares/auth.middleware.js";

import {    allowRoles } from "../middlewares/role.middleware.js";


const router = express.Router();


router.post(
    "/",
    verifyToken,
    allowRoles("hospital"),
    createRequest
);


export default router;