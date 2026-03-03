import mongoose from "mongoose";
import { AdminUser } from "../models/schema.js";
import { generateToken } from "../utils/jwt.js";
import { logActivity } from "../utils/activityLogger.js";

/**
 * POST /auth/login
 * Login with email + password. Returns JWT token + admin info.
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required." });
        }

        const admin = await AdminUser.findOne({ email: email.toLowerCase().trim() }).select("+password");
        if (!admin) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        if (admin.status !== "active") {
            return res.status(403).json({ error: "Your account has been suspended. Contact a superadmin." });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const token = generateToken(admin);

        await logActivity(admin, "LOGIN", "auth", `${admin.name} logged in`, {}, req.ip);

        res.json({
            token,
            admin: {
                id: admin._id,
                email: admin.email,
                name: admin.name,
                role: admin.role,
                mustChangePassword: admin.mustChangePassword || false,
            },
        });
    } catch (error) {
        console.error("[AUTH] Login error:", error.message);
        res.status(500).json({ error: "Login failed. Please try again." });
    }
};

/**
 * GET /auth/me
 * Get current admin info from JWT token (session restore).
 */
export const getMe = async (req, res) => {
    try {
        res.json({
            admin: {
                id: req.admin._id,
                email: req.admin.email,
                name: req.admin.name,
                role: req.admin.role,
                mustChangePassword: req.admin.mustChangePassword || false,
            },
        });
    } catch (error) {
        console.error("[AUTH] getMe error:", error.message);
        res.status(500).json({ error: "Failed to get user info." });
    }
};

/**
 * POST /auth/change-password
 * Change own password (admin only).
 */
export const changePassword = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: "Current password and new password are required." });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: "New password must be at least 6 characters." });
        }

        await session.withTransaction(async () => {
            const admin = await AdminUser.findById(req.admin._id).select("+password").session(session);
            const isMatch = await admin.comparePassword(currentPassword);
            if (!isMatch) {
                throw new Error("Current password is incorrect.");
            }

            admin.password = newPassword;
            admin.mustChangePassword = false;
            await admin.save({ session });

            await logActivity(req.admin, "CHANGE_PASSWORD", "auth", `${req.admin.name} changed their password`, {}, req.ip, session);
        });

        res.json({ message: "Password changed successfully." });
    } catch (error) {
        if (error.message === "Current password is incorrect.") {
            return res.status(401).json({ error: error.message });
        }
        console.error("[AUTH] changePassword error:", error.message);
        res.status(500).json({ error: "Failed to change password." });
    } finally {
        session.endSession();
    }
};
