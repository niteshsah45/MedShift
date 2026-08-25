import Application from "../models/application.model.js";
import Professional from "../models/professional.model.js";
import StaffingRequest from "../models/staffingRequest.model.js";
import { checkEligibility } from "../services/eligibilityForApplying.service.js";
import Hospital from "../models/hospital.model.js";

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

        // only with year of experience greater than or equal to the required experience can apply and with same specialization
        const eligibility =
            checkEligibility(
                professional,
                request
            );


        if(!eligibility.eligible){

            return res.status(403).json({

                success:false,

                message:eligibility.reason

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

export const getApplicationsForHospital_Request = async(req,res)=>{

    try{

        const {requestId}=req.params;


        // Find logged-in hospital

        const hospital = await Hospital.findOne({
            userId:req.user.id
        });


        if(!hospital){

            return res.status(404).json({
                success:false,
                message:"Hospital profile not found"
            });

        }

        // Find request

        const request =
            await StaffingRequest.findById(requestId);



        if(!request){

            return res.status(404).json({
                success:false,
                message:"Staffing request not found"
            });

        }

        // Ownership check

        if(
            request.hospitalId.toString()
            !==
            hospital._id.toString()
        ){

            return res.status(403).json({

                success:false,

                message:"You cannot view applications for this request"

            });

        }

        // Get applications

        const applications =
            await Application.find({
                requestId:requestId
            })
            .populate(
                "professionalId",
                "name specialization experienceYears city verificationStatus"
            );

        res.status(200).json({

            success:true,

            data:applications

        });

    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};