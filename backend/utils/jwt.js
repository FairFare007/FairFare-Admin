import jwt from "jsonwebtoken";

/**
 * Generate a JWT token for an admin user.
 * @param {Object} admin - The admin user document
 * @returns {string} Signed JWT token (7-day expiry)
 */
export const generateToken = (admin) => {
    return jwt.sign(
        { id: admin._id, email: admin.email, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};
