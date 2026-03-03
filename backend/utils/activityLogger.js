import mongoose from "mongoose";
import { AdminActivityLog } from "../models/schema.js";

/**
 * Log an admin activity to the audit trail.
 * @param {Object} admin - The admin user performing the action
 * @param {string} action - Action identifier (e.g. "LOGIN", "APPROVE_ACCESS_REQUEST")
 * @param {string} category - Category (auth, users, tickets, notifications, system, reports)
 * @param {string} details - Human-readable description
 * @param {Object} metadata - Additional structured data
 * @param {string|null} ip - Request IP address
 * @param {Object} [session] - Optional MongoDB session for transactions
 */
export const logActivity = async (admin, action, category, details, metadata = {}, ip = null, session = null) => {
    const logData = {
        admin: admin._id,
        adminEmail: admin.email,
        action,
        category,
        details,
        metadata,
        ip,
    };

    try {
        if (session) {
            // Participate in existing session/transaction
            await AdminActivityLog.create([logData], { session });
        } else {
            // Start a new session and transaction for this specific log
            const internalSession = await mongoose.startSession();
            try {
                await internalSession.withTransaction(async () => {
                    await AdminActivityLog.create([logData], { session: internalSession });
                });
            } finally {
                internalSession.endSession();
            }
        }
    } catch (err) {
        console.error("[ACTIVITY LOG] Transactional logging failed:", err.message);
    }
};
