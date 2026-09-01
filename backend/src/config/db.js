import mongoose from "mongoose";
import { startRequestExpirationJob } from "../jobs/requestExpiration.job.js";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);

        console.log("MongoDB connected successfully");

        startRequestExpirationJob();
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

export default connectDB;