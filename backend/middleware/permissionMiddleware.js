/**
 * Middleware to enforce granular permissions for admin actions.
 * Assumes verifyAdmin has already run and attached req.admin.
 */
export const requirePermission = (permissionKey) => {
    return (req, res, next) => {
        try {
            // Permissions are only enforced for admins
            if (!req.admin) {
                return res.status(401).json({ error: "Authentication required." });
            }

            // Superadmins bypass all permission checks
            if (req.admin.role === "superadmin") {
                return next();
            }

            // Check if admin has the specific permission
            if (!req.admin.permissions || !req.admin.permissions.includes(permissionKey)) {
                console.warn(`[PERMISSION DENIED] Admin ${req.admin.email} attempted to access ${permissionKey} without required permission.`);
                return res.status(403).json({
                    error: "Permission denied",
                    message: `You do not have the required permission: ${permissionKey}`,
                    requiredPermission: permissionKey
                });
            }

            next();
        } catch (error) {
            console.error("[PERMISSION MIDDLEWARE] Error:", error.message);
            res.status(500).json({ error: "Internal server error during permission check." });
        }
    };
};
