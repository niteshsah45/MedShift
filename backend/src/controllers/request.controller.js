import StaffingRequest from "../models/staffingRequest.model.js";
import Hospital from "../models/hospital.model.js";
import {closeStaffingRequestService,
    reopenStaffingRequestService,
    getMyRequestsServiceForHospital
} from "../services/staffingrequest.service.js";


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

export const getAvailableRequests = async (req, res) => {

    try {

        const { page, limit } = req.query;

        const skip = (page - 1) * limit;

        const filter = {
            status: "OPEN",
            startAt: {
                $gt: new Date()
            }
        };

        const [requests, total] = await Promise.all([

            StaffingRequest
                .find(filter)
                .populate(
                    "hospitalId",
                    "hospitalName city address"
                )
                .sort({
                    createdAt: -1
                })
                .skip(skip)
                .limit(limit),

            StaffingRequest.countDocuments(filter)

        ]);

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({

            success: true,

            data: requests,

            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
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


// reopen staffing request by hospital

export const reopenStaffingRequest = async (req, res) => {

    try {

        const { requestId } = req.params;

        const request =
            await reopenStaffingRequestService(
                requestId,
                req.user.id
            );

        res.status(200).json({
            success: true,
            data: request,
            message: "Staffing request reopened"
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// get requests for a hospital owned by a hospital

export const getMyRequestsForHospital = async (req, res) => {

    try {

        const requests =
            await getMyRequestsServiceForHospital(
                req.user.id
            );

        res.status(200).json({
            success: true,
            data: requests
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};