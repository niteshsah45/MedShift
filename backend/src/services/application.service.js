import Application from "../models/application.model.js";
import StaffingRequest from "../models/staffingRequest.model.js";
import Assignment from "../models/assignment.model.js";
import Hospital from "../models/hospital.model.js";
import mongoose from "mongoose";
import { startSession } from "mongoose";

export const acceptApplicationService = async(applicationId,hospitalId)=>{

    // find application

    const session = mongoose.startSession();


    try{

         session.startTransaction();

            const hospital = await Hospital.findOne({
            userId:hospitalId
        });

        if(!hospital){

            throw new Error("Hospital profile not found");

        }
        const application =
            await Application.findById(applicationId).session(session);

        if(!application){

            throw new Error("Application not found");

        }

        // check application state

        if(application.status !== "PENDING"){

            throw new Error(
                "Application already processed"
            );

        }
        // find request

        const request =
            await StaffingRequest.findById(
                application.requestId
            );

        if(!request){

            throw new Error(
                "Staffing request not found"
            );

        }
        if(
            request.hospitalId.toString()
            !==
            hospital._id.toString()
        ){
            throw new Error(
                "You cannot accept applications for this request"
            );
        }

        // check available positions

        if(
            request.positionsFilled >=
            request.requiredPositions
        ){

            throw new Error(
                "All positions already filled"
            );

        }
        // update application

        application.status="ACCEPTED";

        await application.save({session});

        // create assignment

        const assignment =
            await Assignment.create([
                {

                requestId:request._id,

                professionalId:
                    application.professionalId,

                applicationId:
                    application._id

            }
            ],
            {session}
        );

        // increase filled positions

        request.positionsFilled += 1;

        await request.save({session});
        await session.commitTransaction();
        return {
            application,
            assignment
        };
    }
    catch(error){

        await session.abortTransaction();
        throw error;
    }
    finally{
        await session.endSession();
    }
};