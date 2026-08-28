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