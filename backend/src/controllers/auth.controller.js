import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import { registerSchema } from "../validators/auth.validator.js";
import jwt from "jsonwebtoken";


export const register = async(req,res)=>{

    try{

        const {email,password,role}=req.body;


        // 1. Validate input
        await registerSchema.validateAsync(req.body);

        // 2. Check existing user

        const existingUser = await User.findOne({
            email
        });

        if(existingUser){

            return res.status(409).json({
                success:false,
                message:"Email already exists"
            });

        }


        // 3. Hash password

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        // 4. Create user
        const user = await User.create({

            email,
            password:hashedPassword,
            role
        });

        // 5. Send response

        res.status(201).json({

            success:true,

            data:{
                id:user._id,
                email:user.email,
                role:user.role
            },
            message:"User registered successfully"
        });

    }catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });
    }
};

export const login = async(req,res)=>{

    try{

        const {email,password}=req.body;

        if(!(email && password)){
            return res.status(400).json({
                success:false,
                message:"Email and password both are required"
            });
        }
        // Find user

        const user = await User.findOne({
            email
        });

        if(!user){

            return res.status(401).json({
                success:false,
                message:"Invalid credentials"
            });

        }

        // Compare password

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if(!isPasswordCorrect){

            return res.status(401).json({
                success:false,
                message:"Incorrect password"
            });

        }

        const token = jwt.sign(

            {
                id:user._id,
                role:user.role
            },

            process.env.JWT_SECRET,
            {
                expiresIn:"10d"
            }

        );

        res.status(200).json({

            success:true,

            data:{
                token
            },

            message:"Login successful"

        });


    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};