import Professional from "../models/professional.model.js";

export const getMyProfessionalService = async (userId) => {

    const professional = await Professional.findOne({ userId });

    if (!professional) {
        throw new Error("Professional profile not found");
    }

    return professional;
};


export const updateMyProfessionalService = async (userId, data) => {

    const allowedFields = [
        "name",
        "role",
        "specialization",
        "experienceYears",
        "qualifications",
        "city"
    ];

    const updates = {};

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            updates[field] = data[field];
        }
    }

    const professional = await Professional.findOneAndUpdate(
        { userId },
        { $set: updates },
        {
            new: true,
            runValidators: true
        }
    );

    if (!professional) {
        throw new Error("Professional profile not found");
    }

    return professional;
};