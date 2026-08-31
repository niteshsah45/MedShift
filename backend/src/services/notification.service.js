import Notification from "../models/notification.model.js";

export const createNotification = async ({
    userId,
    type,
    title,
    message,
    relatedId
}) => {

    const notification =
        await Notification.create({
            userId,
            type,
            title,
            message,
            relatedId
        });

    return notification;
};

export const markNotificationAsReadService = async (
    notificationId,
    userId
) => {

    const notification =
        await Notification.findOne({
            _id: notificationId,
            userId: userId
        });

    if (!notification) {
        throw new Error(
            "Notification not found"
        );
    }

    notification.isRead = true;

    await notification.save();

    return notification;
};


export const markAllNotificationsAsReadService =
    async (userId) => {

        await Notification.updateMany(
            {
                userId: userId,
                isRead: false
            },
            {
                $set: {
                    isRead: true
                }
            }
        );

        return true;
    };