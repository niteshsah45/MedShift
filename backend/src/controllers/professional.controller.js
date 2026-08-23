import Professional from "../models/professional.model.js";

export const createProfessionalProfile = async(req,res)=>{

    try{

        const existingProfile =
            await Professional.findOne({
                userId:req.user.id
            });


        if(existingProfile){

            return res.status(409).json({
                success:false,
                message:"Professional profile already exists"
            });

        }

        const professional =
            await Professional.create({

                userId:req.user.id,

                ...req.body

            });

        res.status(201).json({

            success:true,

            data:professional,

            message:"Professional profile created"

        });

    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};