import { AdminActivityLog } from "../models/schema.js";

/**
 * GET /auth/activity-logs
 * Get all admin activity logs (admin only). Supports pagination.
 */
export const getActivityLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            AdminActivityLog.find()
                .populate("admin", "name email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            AdminActivityLog.countDocuments(),
        ]);

        res.json({
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("[ACTIVITY LOG] Fetch error:", error.message);
        res.status(500).json({ error: "Failed to fetch activity logs." });
    }
};
