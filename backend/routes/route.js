import express from "express";
import {
    getDashboardStats,
    getUserGrowthStats,
    getActivityStats,
    getFinancialStats,
    getAiUsageStats
} from "../controllers/metric.js";
import { createTicket, getAllTickets, updateTicket, deleteTicket, getTicketStats, getUsersForAssignment } from "../controllers/ticket.js";
import { getAllUsers, updateUserPassword } from "../controllers/user.js";

const router = express.Router();

router.get("/dashboard-stats", getDashboardStats);
router.get("/user-growth", getUserGrowthStats);
router.get("/activity-stats", getActivityStats);
router.get("/financial-stats", getFinancialStats);
router.get("/ai-stats", getAiUsageStats);

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

export default router;
