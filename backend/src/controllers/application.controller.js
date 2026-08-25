import Application from "../models/application.model.js";
import Professional from "../models/professional.model.js";
import StaffingRequest from "../models/staffingRequest.model.js";


export const applyToRequest = async(req,res)=>{

    try{

        const {requestId}=req.params;


        // find professional profile

        const professional =
            await Professional.findOne({
                userId:req.user.id
            });


        if(!professional){

            return res.status(404).json({
                success:false,
                message:"Professional profile not found"
            });

        }



        // check request exists

        const request =
            await StaffingRequest.findById(requestId);


        if(!request){

            return res.status(404).json({
                success:false,
                message:"Staffing request not found"
            });

        }



        // prevent hospital users applying

        const application =
            await Application.create({

                requestId:request._id,

                professionalId:professional._id

            });



        res.status(201).json({

            success:true,

            data:application,

            message:"Application submitted"

        });


    }catch(error){


        if(error.code===11000){

            return res.status(409).json({
                success:false,
                message:"Already applied for this request"
            });

        }


        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};