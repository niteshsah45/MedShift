import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    type: {
        type: String,
        enum: [
            "NEW_APPLICATION",
            "APPLICATION_ACCEPTED",
            "APPLICATION_REJECTED",
            "ASSIGNMENT_COMPLETED",
            "ASSIGNMENT_CANCELLED",
            "VERIFICATION_APPROVED",
            "VERIFICATION_REJECTED",
            "SHIFT_REMINDER"
        ],
        required: true
    },

    title: {
        type: String,
        required: true
    },

    message: {
        type: String,
        required: true
    },

    relatedId: {
        type: mongoose.Schema.Types.ObjectId
    },

    isRead: {
        type: Boolean,
        default: false,
        index: true
    }

}, {
    timestamps: true
});

export default mongoose.model(
    "Notification",
    notificationSchema
);