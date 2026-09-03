import Application from "../models/application.model.js";
import StaffingRequest from "../models/staffingRequest.model.js";
import Assignment from "../models/assignment.model.js";
import Hospital from "../models/hospital.model.js";
import mongoose from "mongoose";
import { checkShiftConflict } from "./conflict.service.js";
import { createNotification } from "./notification.service.js";
import Professional from "../models/professional.model.js";

export const acceptApplicationService = async (
    applicationId,
    hospitalId
) => {

    const session = await mongoose.startSession();

    try {

        session.startTransaction();

        // Find hospital
        const hospital =
            await Hospital.findOne({
                userId: hospitalId
            }).session(session);

        if (!hospital) {
            throw new Error(
                "Hospital profile not found"
            );
        }

        // Find application
        const application =
            await Application.findById(
                applicationId
            ).session(session);

        if (!application) {
            throw new Error(
                "Application not found"
            );
        }

        // Check application state
        if (application.status !== "PENDING") {
            throw new Error(
                "Application already processed"
            );
        }

        // Find request
        const request =
            await StaffingRequest.findById(
                application.requestId
            ).session(session);

        if (!request) {
            throw new Error(
                "Staffing request not found"
            );
        }

        // Ownership check
        if (
            request.hospitalId.toString() !==
            hospital._id.toString()
        ) {
            throw new Error(
                "You cannot accept applications for this request"
            );
        }

        // Check request state
        if (request.status !== "OPEN") {
            throw new Error(
                "Staffing request is not open"
            );
        }

        // Check professional shift conflict
        const { conflict } =
            await checkShiftConflict(
                application.professionalId,
                request.startAt,
                request.endAt,
                session
            );

        if (conflict) {
            throw new Error(
                "Professional already has an overlapping assignment"
            );
        }

        // Find professional
        const professional =
            await Professional.findById(
                application.professionalId
            ).session(session);

        if (!professional) {
            throw new Error(
                "Professional profile not found"
            );
        }

        // Atomically reserve one position
        const updatedRequest =
            await StaffingRequest.findOneAndUpdate(
                {
                    _id: request._id,
                    status: "OPEN",
                    $expr: {
                        $lt: [
                            "$positionsFilled",
                            "$positions"
                        ]
                    }
                },
                {
                    $inc: {
                        positionsFilled: 1
                    }
                },
                {
                    new: true,
                    session
                }
            );

        if (!updatedRequest) {
            throw new Error(
                "No position available"
            );
        }

        // Update application
        application.status = "ACCEPTED";

        await application.save({
            session
        });

        // Create assignment
        const assignments =
            await Assignment.create(
                [
                    {
                        requestId:
                            request._id,

                        professionalId:
                            application.professionalId,

                        applicationId:
                            application._id,

                        startAt:
                            request.startAt,

                        endAt:
                            request.endAt,

                        location:
                            request.location
                    }
                ],
                {
                    session
                }
            );

        const assignment = assignments[0];

        // Mark request as FILLED
        if (
            updatedRequest.positionsFilled >=
            updatedRequest.positions
        ) {

            updatedRequest.status = "FILLED";

            await updatedRequest.save({
                session
            });
        }

        // Commit transaction
        await session.commitTransaction();

        // Notification AFTER successful commit
        await createNotification({
            userId: professional.userId,

            type: "APPLICATION_ACCEPTED",

            title: "Application Accepted",

            message:
                "Your application has been accepted and an assignment has been created.",

            relatedId: assignment._id
        });

        return {
            application,
            assignment
        };

    } catch (error) {

        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        throw error;

    } finally {

        await session.endSession();
    }
};

export const rejectApplicationService = async(
    applicationId,
    hospitalUserId
)=>{

    // find hospital

        const hospital =
            await Hospital.findOne({
                userId:hospitalUserId
            });


        if(!hospital){
            throw new Error(
                "Hospital profile not found"
            );
        }

        // find application
        const application =
            await Application.findById(applicationId);

        if(!application){

            throw new Error(
                "Application not found"
            );
        }

        // check current state

        if(application.status !== "PENDING"){

            throw new Error(
                "Application already processed"
            );
        }

        // find related request

        const request =
            await StaffingRequest.findById(
                application.requestId
            );


        if(!request){

            throw new Error(
                "Staffing request not found"
            );
        }

        // ownership check

        if(
            request.hospitalId.toString()
            !==
            hospital._id.toString()
        ){

            throw new Error(
                "You cannot reject this application"
            );
        }

        // update status
        application.status="REJECTED";

         // find professional
         const professional =
            await Professional.findById(
                application.professionalId
            );

        if (!professional) {
            throw new Error(
                "Professional profile not found"
            );
        }


        await application.save();

        await createNotification({
            userId: professional.userId,
            type: "APPLICATION_REJECTED",
            title: "Application Rejected",
            message:
                "Your application for the staffing request has been rejected.",
            relatedId: application._id
        });


        return application;
};