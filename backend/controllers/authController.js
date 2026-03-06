import mongoose from "mongoose";
import crypto from "crypto";
import { AdminUser } from "../models/schema.js";
import { generateToken } from "../utils/jwt.js";
import { logActivity } from "../utils/activityLogger.js";
import { buildForgotPasswordEmail } from "../utils/forgotPasswordEmail.js";
import { sendMail } from "../utils/mailClient.js";

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
                permissions: admin.permissions || [],
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
                permissions: req.admin.permissions || [],
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

/**
 * POST /auth/forgot-password
 * Resets admin password to a temporary one and sends via email.
 */
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email is required." });
        }

        const admin = await AdminUser.findOne({ email: email.toLowerCase().trim() });
        if (!admin) {
            // For security, don't reveal if email exists, but the user asked for this flow
            // Actually, in admin panels, it's often okay to say if it failed or succeeded privately.
            // But let's be descriptive as it's an admin-only portal.
            return res.status(404).json({ error: "No admin found with this email address." });
        }

        // Generate a temporary password
        const tempPassword = crypto.randomBytes(5).toString("hex").toUpperCase(); // 10 chars

        // Update admin
        admin.password = tempPassword;
        admin.mustChangePassword = true;
        await admin.save();

        // Send email
        const { html, text, subject } = buildForgotPasswordEmail({ 
            name: admin.name, 
            tempPassword 
        });

        await sendMail({
            to: admin.email,
            subject,
            text,
            html
        });

        await logActivity(admin, "FORGOT_PASSWORD", "auth", `Password reset requested for ${admin.name}`, {}, req.ip);

        res.json({ message: "A temporary password has been sent to your registered email address." });
    } catch (error) {
        console.error("[AUTH] forgotPassword error:", error.message);
        res.status(500).json({ error: "Failed to process request. Please try again later." });
    }
};
