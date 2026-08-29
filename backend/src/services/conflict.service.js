import Assignment from "../models/assignment.model.js";

export const checkShiftConflict = async (
    professionalId,
    shiftDate,
    startTime,
    endTime
) => {

    // Validate time range
    if (startTime >= endTime) {
        throw new Error(
            "Shift start time must be before end time"
        );
    }

    // Convert requested date into a UTC day range
    const date = new Date(shiftDate);

    if (isNaN(date.getTime())) {
        throw new Error("Invalid shift date");
    }

    const dayStart = new Date(date);
    dayStart.setUTCHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);


    // Find overlapping ACTIVE assignment
    const conflict = await Assignment.findOne({

        professionalId,

        status: "ACTIVE",

        shiftDate: {
            $gte: dayStart,
            $lt: dayEnd
        },

        startTime: {
            $lt: endTime
        },

        endTime: {
            $gt: startTime
        }
    });


    if (conflict) {

        return {
            conflict: true,
            assignment: conflict
        };
    }


    return {
        conflict: false
    };
};