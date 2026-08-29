import Assignment from "../models/assignment.model.js";
import Hospital from "../models/hospital.model.js";
import StaffingRequest from "../models/staffingRequest.model.js";

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
        "department requiredRole specialization shiftDate startTime endTime location pay"
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

    return assignment;
};