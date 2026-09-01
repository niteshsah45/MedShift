import mongoose from "mongoose";

const staffingRequestSchema = new mongoose.Schema({

    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
        required: true
    },

    department: {
        type: String,
        required: true
    },

    requiredRole: {
        type: String,
        required: true
    },

    specialization: {
        type: String
    },

    requiredExperience: {
        type: Number,
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

    pay: {
        type: Number,
        required: true
    },

    positions: {
        type: Number,
        required: true
    },

    positionsFilled: {
        type: Number,
        default: 0
    },

    location: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: [
            "OPEN",
            "FILLED",
            "CLOSED",
            "EXPIRED"
        ],
        default: "OPEN"
    }

}, {
    timestamps: true
});

const StaffingRequest =
mongoose.model(
    "StaffingRequest",
    staffingRequestSchema
);


export default StaffingRequest;