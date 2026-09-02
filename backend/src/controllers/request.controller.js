import StaffingRequest from "../models/staffingRequest.model.js";
import Hospital from "../models/hospital.model.js";
import {closeStaffingRequestService} from "../services/staffingrequest.service.js";


export const createRequest = async(req,res)=>{

    try{

        // Find hospital profile of logged-in user

        const hospital = await Hospital.findOne({
            userId:req.user.id
        });


        if(!hospital){

            return res.status(404).json({
                success:false,
                message:"Hospital profile not found cannot post shift request"
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

export const getAvailableRequests = async(req,res)=>{

    try{

        const requests = await StaffingRequest
            .find({
                status:"OPEN",
                startAt:{
                    $gt: new Date()
                }
            })
            .populate(
                "hospitalId",
                "hospitalName city address"
            );

        res.status(200).json({

            success:true,

            data:requests

        });


    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};

// close staffing request by hospital

export const closeStaffingRequest = async (
    req,
    res
) => {

    try {

        const { requestId } = req.params;

        const request =
            await closeStaffingRequestService(
                requestId,
                req.user.id
            );

        res.status(200).json({
            success: true,
            data: request,
            message: "Staffing request closed"
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};