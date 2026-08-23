import express from "express";
import authRoutes from "./routes/auth.routes.js";
import professionalRoutes from "./routes/professional.routes.js";
import hospitalRoutes from "./routes/hospital.routes.js";

const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/professionals",professionalRoutes);
app.use("/api/v1/hospitals", hospitalRoutes);

app.get("/", (req,res)=>{
    res.json({
        success:true,
        message:"MedShift API is running"
    });
});

export default app;