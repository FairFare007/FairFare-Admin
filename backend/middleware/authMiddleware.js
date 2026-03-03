import jwt from "jsonwebtoken";
import { AdminUser } from "../models/schema.js";

/**
 * Middleware to verify admin JWT token.
 * Extracts token from Authorization: Bearer <token> header,
 * verifies it, looks up the AdminUser, and attaches req.admin.
 */
export const verifyAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "No token provided. Please login." });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const admin = await AdminUser.findById(decoded.id);
        if (!admin) {
            return res.status(401).json({ error: "Admin user not found. Token invalid." });
        }

        if (admin.status !== "active") {
            return res.status(403).json({ error: "Your account has been suspended." });
        }

        req.admin = admin;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired. Please login again." });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token. Please login again." });
        }
        console.error("[AUTH MIDDLEWARE] Error:", error.message);
        return res.status(500).json({ error: "Authentication failed." });
    }
};
