import Assignment from "../models/assignment.model.js";

export const checkShiftConflict = async (
    professionalId,
    startAt,
    endAt,
    session
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
        }).session(session);

    return {
        conflict: !!conflict,
        assignment: conflict
    };
};