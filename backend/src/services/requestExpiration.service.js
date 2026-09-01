import StaffingRequest
    from "../models/staffingRequest.model.js";

export const expireStaffingRequests = async () => {

    const result =
        await StaffingRequest.updateMany(
            {
                status: {
                    $in: ["OPEN", "FILLED"]
                },

                startAt: {
                    $lte: new Date()
                }
            },
            {
                $set: {
                    status: "EXPIRED"
                }
            }
        );

    return result.modifiedCount;
};