import express from "express";
import authRoutes from "./routes/auth.routes.js";
import professionalRoutes from "./routes/professional.routes.js";
import hospitalRoutes from "./routes/hospital.routes.js";
import requestRoutes from "./routes/request.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import assignmentRoutes from "./routes/assignment.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import verificationRoutes from "./routes/verification.routes.js";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/professionals",professionalRoutes);
app.use("/api/v1/hospitals", hospitalRoutes);
app.use("/api/v1/requests", requestRoutes);
app.use("/api/v1/applications",applicationRoutes);
app.use("/api/v1/assignments",assignmentRoutes);
app.use("/api/v1/notifications",notificationRoutes);
app.use("/api/v1/verifications",verificationRoutes);


app.get("/", (req,res)=>{
    res.json({
        success:true,
        message:"MedShift API is running"
    });
});

export default app;