import StaffingRequest from "../models/staffingRequest.model.js";
import Hospital from "../models/hospital.model.js";


export const createRequest = async(req,res)=>{

    try{

        // Find hospital profile of logged-in user

        const hospital = await Hospital.findOne({
            userId:req.user.id
        });


        if(!hospital){

            return res.status(404).json({
                success:false,
                message:"Hospital profile not found"
            });

        }


        const request = await StaffingRequest.create({

            hospitalId:hospital._id,

            ...req.body
        });


        res.status(201).json({

            success:true,

            data:request,

            message:"Staffing request created"
        });


    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};