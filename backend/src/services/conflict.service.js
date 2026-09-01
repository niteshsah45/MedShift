import Assignment from "../models/assignment.model.js";

export const checkShiftConflict = async (
    professionalId,
    startAt,
    endAt
) => {

    const conflict =
        await Assignment.findOne({
            professionalId,
            status: "ACTIVE",

            startAt: {
                $lt: endAt
            },

            endAt: {
                $gt: startAt
            }
        });

    return {
        conflict: !!conflict,
        assignment: conflict
    };
};