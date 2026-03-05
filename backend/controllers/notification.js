import { User } from "../models/schema.js";
import notificationService from "../services/notificationService.js";
import { logActivity } from "../utils/activityLogger.js";

// Get notification statistics
export const getNotificationStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const usersWithFCM = await User.countDocuments({ fcmToken: { $ne: null, $exists: true } });
        const usersWithoutFCM = totalUsers - usersWithFCM;

        res.status(200).json({
            totalUsers,
            usersWithFCM,
            usersWithoutFCM,
        });
    } catch (error) {
        console.error("Error fetching notification stats:", error);
        res.status(500).json({ message: "Failed to fetch notification stats" });
    }
};

// Get lists of users with and without FCM tokens
export const getNotificationUsers = async (req, res) => {
    try {
        // Get users with FCM tokens
        const usersWithFCM = await User.find(
            { fcmToken: { $ne: null, $exists: true } },
            { username: 1, email: 1, fcmToken: 1 }
        ).lean();

        // Get users without FCM tokens
        const usersWithoutFCM = await User.find(
            { $or: [{ fcmToken: null }, { fcmToken: { $exists: false } }] },
            { username: 1, email: 1 }
        ).lean();

        // Format the response to match frontend expectations
        const formattedUsersWithFCM = usersWithFCM.map(user => ({
            name: user.username,
            email: user.email,
            phoneNumber: user.email, // Using email as fallback since schema doesn't have phoneNumber
        }));

        const formattedUsersWithoutFCM = usersWithoutFCM.map(user => ({
            name: user.username,
            email: user.email,
            phoneNumber: user.email,
        }));

        res.status(200).json({
            usersWithFCM: formattedUsersWithFCM,
            usersWithoutFCM: formattedUsersWithoutFCM,
        });
    } catch (error) {
        console.error("Error fetching notification users:", error);
        res.status(500).json({ message: "Failed to fetch notification users" });
    }
};

/**
 * POST /send-notification
 * Send push notifications to all or selected users.
 * Body: { title, body, tokens? } — if tokens array is provided, send only to those.
 */
export const sendNotification = async (req, res) => {
    try {
        const { title, body, tokens: targetTokens } = req.body;

        if (!title || !body) {
            return res.status(400).json({ message: "Title and body are required" });
        }

        let tokens;

        if (Array.isArray(targetTokens) && targetTokens.length > 0) {
            // Send to selected tokens only
            tokens = targetTokens.filter(Boolean);
        } else {
            // Fetch all FCM tokens from DB
            const users = await User.find(
                { fcmToken: { $ne: null, $exists: true } },
                { fcmToken: 1 }
            ).lean();
            tokens = users.map((u) => u.fcmToken).filter(Boolean);
        }

        if (tokens.length === 0) {
            return res.status(400).json({ message: "No users with notifications enabled found." });
        }

        // Send notifications in batches of 500 (FCM multicast limit)
        const BATCH_SIZE = 500;
        let totalSuccess = 0;
        let totalFail = 0;

        for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
            const batch = tokens.slice(i, i + BATCH_SIZE);
            try {
                const result = await notificationService.sendToMultiple(batch, title, body);
                totalSuccess += result.successCount;
                totalFail += result.failureCount;
            } catch (err) {
                console.error(`[NOTIFICATION] Batch ${i / BATCH_SIZE + 1} failed:`, err.message);
                totalFail += batch.length;
            }
        }

        // Log activity
        await logActivity(
            req.admin,
            "SEND_NOTIFICATION",
            "notifications",
            `Sent push notification "${title}" to ${totalSuccess} users (${totalFail} failed)`,
            { title, totalRecipients: tokens.length, successCount: totalSuccess, failCount: totalFail },
            req.ip
        );

        res.status(200).json({
            message: "Notifications sent successfully.",
            totalRecipients: tokens.length,
            successCount: totalSuccess,
            failCount: totalFail,
        });
    } catch (error) {
        console.error("Error sending notifications:", error);
        res.status(500).json({ message: "Failed to send notifications." });
    }
};
