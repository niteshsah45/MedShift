
import {
    getAdminDashboardService
} from "../services/admin.service.js";


export const getAdminDashboard = async (req, res) => {

    try {

        const statistics =
            await getAdminDashboardService();

        res.status(200).json({

            success: true,

            data: statistics

        });

    } catch (error) {

        console.error(
            "Admin dashboard error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to load admin dashboard"

        });

    }
};