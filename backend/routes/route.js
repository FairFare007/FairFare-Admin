import express from "express";
import {
    getDashboardStats,
    getUserGrowthStats,
    getActivityStats,
    getFinancialStats,
    getAiUsageStats,
    getActiveUsersStats
} from "../controllers/metric.js";
import { createTicket, getAllTickets, updateTicket, deleteTicket, getTicketStats, getUsersForAssignment } from "../controllers/ticket.js";
import { getAllUsers, updateUserPassword } from "../controllers/user.js";
import { getNotificationStats, getNotificationUsers, sendNotification } from "../controllers/notification.js";
import { generateAndSendDailyReport } from "../services/dailyEmailReport.js";

const router = express.Router();

router.get("/dashboard-stats", getDashboardStats);
router.get("/user-growth", getUserGrowthStats);
router.get("/activity-stats", getActivityStats);
router.get("/financial-stats", getFinancialStats);
router.get("/ai-stats", getAiUsageStats);
router.get("/active-users-stats", getActiveUsersStats);

// Ticket Routes
router.post("/tickets", createTicket);
router.get("/tickets", getAllTickets);
router.get("/tickets/users", getUsersForAssignment);
router.patch("/tickets/:id", updateTicket);
router.delete("/tickets/:id", deleteTicket);
router.get("/ticket-stats", getTicketStats);

// User Routes
router.get("/users", getAllUsers);
router.patch("/users/:id/password", updateUserPassword);

// Notification Routes
router.get("/notification-stats", getNotificationStats);
router.get("/notification-users", getNotificationUsers);
router.post("/send-notification", sendNotification);

// Daily Report - Manual Trigger (for testing)
router.post("/trigger-daily-report", async (req, res) => {
    try {
        await generateAndSendDailyReport();
        res.json({ message: "Daily report sent successfully" });
    } catch (error) {
        console.error("[TRIGGER] Failed to send daily report:", error.message);
        res.status(500).json({ error: "Failed to send daily report", details: error.message });
    }
});

export default router;
