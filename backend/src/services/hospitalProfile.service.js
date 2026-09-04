import Hospital from "../models/hospital.model.js";

export const getMyHospitalService = async (userId) => {
    const hospital = await Hospital.findOne({ userId });

    if (!hospital) {
        throw new Error("Hospital profile not found");
    }

    return hospital;
};


export const updateMyHospitalService = async (userId, data) => {

    const allowedFields = [
        "hospitalName",
        "address",
        "city",
        "departments"
    ];

    const updates = {};

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            updates[field] = data[field];
        }
    }

    const hospital = await Hospital.findOneAndUpdate(
        { userId },
        { $set: updates },
        {
            new: true,
            runValidators: true
        }
    );

    if (!hospital) {
        throw new Error("Hospital profile not found");
    }

    return hospital;
};
