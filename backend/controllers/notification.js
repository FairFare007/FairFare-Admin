import { User } from "../models/schema.js";

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

// Placeholder for send notification endpoint (actual sending logic to be implemented later)
export const sendNotification = async (req, res) => {
    try {
        const { title, body } = req.body;

        if (!title || !body) {
            return res.status(400).json({ message: "Title and body are required" });
        }

        // Get count of users who will receive the notification
        const usersWithFCM = await User.countDocuments({ fcmToken: { $ne: null, $exists: true } });

        // TODO: Implement actual FCM notification sending logic here
        // This is where you would:
        // 1. Get all FCM tokens
        // 2. Use Firebase Admin SDK to send notifications
        // 3. Handle success/failure responses

        console.log(`Notification would be sent to ${usersWithFCM} users:`);
        console.log(`Title: ${title}`);
        console.log(`Body: ${body}`);

        res.status(200).json({
            message: "Notification endpoint ready (sending logic not implemented yet)",
            recipientCount: usersWithFCM,
            title,
            body,
        });
    } catch (error) {
        console.error("Error in send notification:", error);
        res.status(500).json({ message: "Failed to process notification request" });
    }
};
