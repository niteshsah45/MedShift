import Assignment from "../models/assignment.model.js";
import Hospital from "../models/hospital.model.js";
import StaffingRequest from "../models/staffingRequest.model.js";
import {createNotification} from "./notification.service.js";
import Professional from "../models/professional.model.js";

export const getHospitalAssignmentsService = async (userId) => {

    const hospital = await Hospital.findOne({
        userId
    });

    if (!hospital) {
        throw new Error("Hospital profile not found");
    }

    const requests = await StaffingRequest.find({
        hospitalId: hospital._id
    }).select("_id");

    const requestIds = requests.map(
        request => request._id
    );

    const assignments = await Assignment.find({
        requestId: { $in: requestIds }
    })
    .populate(
        "professionalId",
        "name role specialization experienceYears city verificationStatus"
    )
    .populate(
        "requestId",
        "department requiredRole specialization startAt endAt location pay"
    );

    return assignments;
};

export const completeAssignmentService = async (
    assignmentId,
    userId
) => {

    // Find hospital belonging to logged-in user
    const hospital = await Hospital.findOne({
        userId
    });

    if (!hospital) {
        throw new Error("Hospital profile not found");
    }


    // Find assignment
    const assignment = await Assignment.findById(
        assignmentId
    );

    if (!assignment) {
        throw new Error("Assignment not found");
    }


    // Check current assignment state
    if (assignment.status !== "ACTIVE") {
        throw new Error(
            "Assignment is already processed"
        );
    }


    // Find related staffing request
    const request = await StaffingRequest.findById(
        assignment.requestId
    );

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
            "You cannot complete this assignment"
        );
    }


    // Complete assignment
    assignment.status = "COMPLETED";

    await assignment.save();

    const professional =
        await Professional.findById(
            assignment.professionalId
        );

    if (!professional) {
        throw new Error(
            "Professional profile not found"
        );
    }

    await createNotification({
        userId: professional.userId,
        type: "ASSIGNMENT_COMPLETED",
        title: "Assignment Completed",
        message:
            "Your staffing assignment has been marked as completed.",
        relatedId: assignment._id
    });

    return assignment;
};

export const cancelAssignmentFromProfessional = async (
    assignmentId,
    professionalUserId
) => {

    // Find professional
    const professional =
        await Professional.findOne({
            userId: professionalUserId
        });

    if (!professional) {
        throw new Error(
            "Professional profile not found"
        );
    }

    // Find assignment
    const assignment =
        await Assignment.findById(
            assignmentId
        );

    if (!assignment) {
        throw new Error(
            "Assignment not found"
        );
    }

    // Ownership check
    if (
        assignment.professionalId.toString() !==
        professional._id.toString()
    ) {
        throw new Error(
            "You cannot cancel this assignment"
        );
    }

    // Only active assignments can be cancelled
    if (assignment.status !== "ACTIVE") {
        throw new Error(
            "Assignment is already processed"
        );
    }

    // Find request
    const request =
        await StaffingRequest.findById(
            assignment.requestId
        );

    if (!request) {
        throw new Error(
            "Staffing request not found"
        );
    }

    // Cancel assignment
    assignment.status = "CANCELLED";

    await assignment.save();


    // Recalculate active assignments
    const activeAssignments =
        await Assignment.countDocuments({
            requestId: request._id,
            status: "ACTIVE"
        });


    request.positionsFilled =
        activeAssignments;


    // If vacancy exists, reopen request
    if (
        request.positionsFilled <
        request.requiredPositions
    ) {

        // Don't reopen intentionally closed requests
        if (request.status === "FILLED") {
            request.status = "OPEN";
        }
    }


    await request.save();


    // Find hospital
    const hospital =
        await Hospital.findById(
            request.hospitalId
        );

    if (hospital) {

        await createNotification({
            userId: hospital.userId,

            type: "ASSIGNMENT_CANCELLED",

            title:
                "Assignment Cancelled",

            message:
                "A professional has cancelled their assignment. A position is now available for this staffing request.",

            relatedId: assignment._id
        });
    }


    return {
        assignment,
        request
    };
};

export const cancelAssignmentFromHospital= async (
    assignmentId,
    hospitalUserId
) => {

    // Find hospital
    const hospital = await Hospital.findOne({
        userId: hospitalUserId
    });

    if (!hospital) {
        throw new Error("Hospital profile not found");
    }

    // Find assignment
    const assignment =
        await Assignment.findById(assignmentId);

    if (!assignment) {
        throw new Error("Assignment not found");
    }

    // Find request
    const request =
        await StaffingRequest.findById(
            assignment.requestId
        );

    if (!request) {
        throw new Error("Staffing request not found");
    }

    // Check ownership
    if (
        request.hospitalId.toString() !==
        hospital._id.toString()
    ) {
        throw new Error(
            "You cannot cancel this assignment"
        );
    }

    // Assignment must be active
    if (assignment.status !== "ACTIVE") {
        throw new Error(
            "Assignment is already processed"
        );
    }

    // Cancel assignment
    assignment.status = "CANCELLED";

    await assignment.save();

    // Recalculate active assignments
    const activeAssignments =
        await Assignment.countDocuments({
            requestId: request._id,
            status: "ACTIVE"
        });

    request.positionsFilled =
        activeAssignments;

    // Reopen only if request was FILLED
    if (
        request.status === "FILLED" &&
        request.positionsFilled <
        request.requiredPositions
    ) {
        request.status = "OPEN";
    }

    await request.save();

    // Find professional
    const professional =
        await Professional.findById(
            assignment.professionalId
        );

    if (professional) {

        await createNotification({
            userId: professional.userId,

            type: "ASSIGNMENT_CANCELLED",

            title: "Assignment Cancelled",

            message:
                "Your assignment has been cancelled by the hospital.",

            relatedId: assignment._id
        });
    }

    return {
        assignment,
        request
    };
};