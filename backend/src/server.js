import "dotenv/config";
import app from "./app.js";
import { startRequestExpirationJob } from "./jobs/requestExpiration.job.js";

import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async ()=>{

    await connectDB();


    app.listen(PORT, () => {
        console.log(`MedShift server running on port ${PORT}`);
    });
}

startServer();
