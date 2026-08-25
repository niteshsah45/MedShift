import express from "express";

import { applyToRequest} from "../controllers/application.controller.js";


import { verifyToken} from "../middlewares/auth.middleware.js";


import {allowRoles} from "../middlewares/role.middleware.js";


const router = express.Router();


router.post(
    "/requests/:requestId/apply",
    verifyToken,
    allowRoles("professional"),
    applyToRequest
);


export default router;