import express from "express";

import {
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from "../controllers/notification.controller.js";

import { verifyToken }
    from "../middlewares/auth.middleware.js";

import {validate} from "../middlewares/validation.middleware.js";
import {notificationIdSchema} from "../validators/notifications.validator.js";

const router = express.Router();

router.get(
    "/my",
    verifyToken,
    getMyNotifications
);

router.patch(
    "/:notificationId/read",
    verifyToken,
    validate(notificationIdSchema,"params"),
    markNotificationAsRead
);

router.patch(
    "/read-all",
    verifyToken,
    markAllNotificationsAsRead
);

export default router;