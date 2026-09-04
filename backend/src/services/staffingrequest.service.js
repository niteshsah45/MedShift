import StaffingRequest from "../models/staffingRequest.model.js";
import Hospital from "../models/hospital.model.js";

export const closeStaffingRequestService = async (
    requestId,
    hospitalUserId
) => {

    // Find hospital profile
    const hospital =
        await Hospital.findOne({
            userId: hospitalUserId
        });

    if (!hospital) {
        throw new Error(
            "Hospital profile not found"
        );
    }

    // Find request
    const request =
        await StaffingRequest.findById(requestId);

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
            "You cannot close this request"
        );
    }

    // Request must be OPEN
    if (request.status !== "OPEN") {
        throw new Error(
            `Request cannot be closed because it is already ${request.status}`
        );
    }

    // Close request
    request.status = "CLOSED";

    await request.save();

    return request;
};

// get requests for a hospital owned by a hospital

export const getMyRequestsServiceForHospital = async (userId) => {

    const hospital =
        await Hospital.findOne({
            userId
        });

    if (!hospital) {
        throw new Error(
            "Hospital profile not found"
        );
    }

    const requests =
        await StaffingRequest.find({
            hospitalId: hospital._id
        })
        .sort({
            createdAt: -1
        });

    return requests;
};