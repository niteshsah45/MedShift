import Hospital from "../models/hospital.model.js";


export const createHospitalProfile = async(req,res)=>{

    try{


        const existingHospital =
            await Hospital.findOne({
                userId:req.user.id
            });


        if(existingHospital){

            return res.status(409).json({
                success:false,
                message:"Hospital profile already exists"
            });

        }


        const hospital =
            await Hospital.create({

                userId:req.user.id,

                ...req.body

            });



        res.status(201).json({

            success:true,

            data:hospital,

            message:"Hospital profile created"

        });


    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};