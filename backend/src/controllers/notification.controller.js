import Notification from "../models/notification.model.js";
import { markNotificationAsReadService,
    markAllNotificationsAsReadService
} from "../services/notification.service.js";

export const getMyNotifications = async (req, res) => {

    try {

        const notifications =
            await Notification.find({
                userId: req.user.id
            })
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// for hospital to mark a notification as read
export const markNotificationAsRead = async (
    req,
    res
) => {

    try {

        const { notificationId } =
            req.params;

        const notification =
            await markNotificationAsReadService(
                notificationId,
                req.user.id
            );

        res.status(200).json({
            success: true,
            data: notification,
            message: "Notification marked as read"
        });

    } catch (error) {

        res.status(404).json({
            success: false,
            message: error.message
        });

    }
};

// for hospital to mark all notifications as read
export const markAllNotificationsAsRead =
    async (req, res) => {

        try {

            await markAllNotificationsAsReadService(
                req.user.id
            );

            res.status(200).json({
                success: true,
                message:
                    "All notifications marked as read"
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message: error.message
            });

        }
    };