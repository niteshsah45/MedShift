import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({

    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StaffingRequest",
        required: true
    },

    professionalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Professional",
        required: true
    },

    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
        required: true
    },

    startAt: {
        type: Date,
        required: true
    },

    endAt: {
        type: Date,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: [
            "ACTIVE",
            "COMPLETED",
            "CANCELLED"
        ],
        default: "ACTIVE"
    }

}, {
    timestamps: true
});

// Helps conflict checking
assignmentSchema.index({
    professionalId: 1,
    status: 1,
    startAt: 1,
    endAt: 1
});

// prevent duplicate assignments for the same application
assignmentSchema.index(
    {
        applicationId: 1
    },
    {
        unique: true
    }
);

export default mongoose.model(
    "Assignment",
    assignmentSchema
);