import express from "express";
import { register,login } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/me", verifyToken, (req,res)=>{

    res.json({
        success:true,
        user:req.user
    });

});

router.get(
    "/hospital-only",
    verifyToken,
    allowRoles("hospital"),
    (req,res)=>{
        res.json({
            success:true,
            message:"Hospital access granted"
        });

    }
);
router.post("/register", register);
router.post("/login",login);
export default router;