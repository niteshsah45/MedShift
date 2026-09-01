import cron from "node-cron";

import {
    expireStaffingRequests
} from "../services/requestExpiration.service.js";

export const startRequestExpirationJob = () => {

    cron.schedule("* * * * *", async () => {

        try {

            const count =
                await expireStaffingRequests();

            if (count > 0) {

                console.log(
                    `${count} staffing request(s) expired`
                );
            }

        } catch (error) {

            console.error(
                "Request expiration job failed:",
                error.message
            );
        }
    });

    console.log(
        "Staffing request expiration job started"
    );
};