import { AdminUser, PermissionRequest, AdminActivityLog, User } from "../models/schema.js";
import { logActivity } from "../utils/activityLogger.js";

/**
 * GET /permissions/my
 * Get current admin's permissions.
 */
export const getMyPermissions = async (req, res) => {
    try {
        res.json({
            role: req.admin.role,
            permissions: req.admin.permissions || []
        });
    } catch (error) {
        console.error("[PERMISSIONS] My permissions error:", error.message);
        res.status(500).json({ error: "Failed to fetch permissions." });
    }
};

/**
 * GET /permissions/all-admins (Superadmin or manage_permissions)
 * List all admins and their current permissions.
 */
export const getAllAdmins = async (req, res) => {
    try {
        const admins = await AdminUser.find({}, "name email role status permissions").sort({ name: 1 });

        // Sync names in real-time before returning
        const syncedAdmins = await Promise.all(admins.map(async (admin) => {
            const fairfareUser = await User.findOne({ email: admin.email });
            if (fairfareUser && fairfareUser.username !== admin.name) {
                admin.name = fairfareUser.username;
                await admin.save();
            }
            return admin;
        }));

        res.json(syncedAdmins);
    } catch (error) {
        console.error("[PERMISSIONS] Fetch admins error:", error.message);
        res.status(500).json({ error: "Failed to fetch admins." });
    }
};

/**
 * PATCH /permissions/:adminId (Superadmin or manage_permissions)
 * Grant or revoke permissions for an admin.
 */
export const updatePermissions = async (req, res) => {
    try {
        const { adminId } = req.params;
        const { permissions } = req.body;

        if (!Array.isArray(permissions)) {
            return res.status(400).json({ error: "Permissions must be an array." });
        }

        const targetAdmin = await AdminUser.findById(adminId);
        if (!targetAdmin) {
            return res.status(404).json({ error: "Admin not found." });
        }

        // Hierarchy Enforcement:
        // 1. Regular admins with 'manage_permissions' CANNOT touch superadmins.
        // 2. Superadmins CAN modify each other.
        if (targetAdmin.role === "superadmin" && req.admin.role !== "superadmin") {
            return res.status(403).json({ error: "Access denied. Only a superadmin can modify another superadmin." });
        }

        const oldPermissions = targetAdmin.permissions || [];
        targetAdmin.permissions = permissions;
        await targetAdmin.save();

        await logActivity(
            req.admin,
            "UPDATE_PERMISSIONS",
            "system",
            `Updated permissions for ${targetAdmin.name} (${targetAdmin.email})`,
            { adminId, oldPermissions, newPermissions: permissions },
            req.ip
        );

        res.json({ message: "Permissions updated successfully.", permissions: targetAdmin.permissions });
    } catch (error) {
        console.error("[PERMISSIONS] Update error:", error.message);
        res.status(500).json({ error: "Failed to update permissions." });
    }
};

/**
 * PATCH /permissions/:adminId/promote (Superadmin only)
 */
export const promoteToSuperadmin = async (req, res) => {
    try {
        if (req.admin.role !== "superadmin") {
            return res.status(403).json({ error: "Only superadmins can promote others to superadmin." });
        }

        const { adminId } = req.params;
        const targetAdmin = await AdminUser.findById(adminId);
        if (!targetAdmin) return res.status(404).json({ error: "Admin not found." });

        if (targetAdmin.role === "superadmin") {
            return res.status(400).json({ error: "Admin is already a superadmin." });
        }

        targetAdmin.role = "superadmin";
        await targetAdmin.save();

        await logActivity(req.admin, "PROMOTE_ADMIN", "system", `Promoted ${targetAdmin.name} to superadmin`, { adminId }, req.ip);

        res.json({ message: `${targetAdmin.name} is now a superadmin.` });
    } catch (error) {
        res.status(500).json({ error: "Failed to promote admin." });
    }
};

/**
 * PATCH /permissions/:adminId/demote (Superadmin only)
 */
export const demoteFromSuperadmin = async (req, res) => {
    try {
        if (req.admin.role !== "superadmin") {
            return res.status(403).json({ error: "Only superadmins can demote others." });
        }

        const { adminId } = req.params;
        
        // Prevent self-demotion if they are the only superadmin
        if (adminId === req.admin._id.toString()) {
            const superCount = await AdminUser.countDocuments({ role: "superadmin" });
            if (superCount <= 1) {
                return res.status(400).json({ error: "Cannot demote yourself. You are the only superadmin." });
            }
        }

        const targetAdmin = await AdminUser.findById(adminId);
        if (!targetAdmin) return res.status(404).json({ error: "Admin not found." });

        if (targetAdmin.role !== "superadmin") {
            return res.status(400).json({ error: "User is not a superadmin." });
        }

        targetAdmin.role = "admin";
        await targetAdmin.save();

        await logActivity(req.admin, "DEMOTE_ADMIN", "system", `Demoted ${targetAdmin.name} to admin`, { adminId }, req.ip);

        res.json({ message: `${targetAdmin.name} is now a regular admin.` });
    } catch (error) {
        res.status(500).json({ error: "Failed to demote admin." });
    }
};

/**
 * POST /permissions/requests
 */
export const submitRequest = async (req, res) => {
    try {
        const { permission, reason } = req.body;
        if (!permission || !reason) {
            return res.status(400).json({ error: "Permission key and reason are required." });
        }

        const existing = await PermissionRequest.findOne({
            admin: req.admin._id,
            permission,
            status: "pending"
        });

        if (existing) {
            return res.status(400).json({ error: "You already have a pending request for this permission." });
        }

        const request = await PermissionRequest.create({
            admin: req.admin._id,
            permission,
            reason
        });

        res.status(201).json({ message: "Permission request submitted successfully.", request });
    } catch (error) {
        res.status(500).json({ error: "Failed to submit request." });
    }
};

/**
 * GET /permissions/requests/my
 * Get current admin's permission requests.
 */
export const getMyRequests = async (req, res) => {
    try {
        const requests = await PermissionRequest.find({ admin: req.admin._id })
            .populate("reviewedBy", "name")
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        console.error("[PERMISSIONS] Fetch my requests error:", error.message);
        res.status(500).json({ error: "Failed to fetch your requests." });
    }
};

/**
 * GET /permissions/requests (Superadmin / manage_permissions)
 */
export const getRequests = async (req, res) => {
    try {
        const requests = await PermissionRequest.find()
            .populate("admin", "name email")
            .populate("reviewedBy", "name")
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch requests." });
    }
};

/**
 * PATCH /permissions/requests/:id/approve
 */
export const approveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await PermissionRequest.findById(id);
        if (!request) return res.status(404).json({ error: "Request not found." });
        if (request.status !== "pending") return res.status(400).json({ error: "Request already processed." });

        const targetAdmin = await AdminUser.findById(request.admin);
        if (!targetAdmin) return res.status(404).json({ error: "Associated admin not found." });

        // Add permission if not exists
        if (!targetAdmin.permissions.includes(request.permission)) {
            targetAdmin.permissions.push(request.permission);
            await targetAdmin.save();
        }

        request.status = "approved";
        request.reviewedBy = req.admin._id;
        await request.save();

        await logActivity(
            req.admin,
            "APPROVE_PERMISSION_REQUEST",
            "system",
            `Approved ${request.permission} for ${targetAdmin.name}`,
            { requestId: id, adminId: targetAdmin._id, permission: request.permission },
            req.ip
        );

        res.json({ message: "Request approved and permission granted." });
    } catch (error) {
        res.status(500).json({ error: "Failed to approve request." });
    }
};

/**
 * PATCH /permissions/requests/:id/reject
 */
export const rejectRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await PermissionRequest.findById(id);
        if (!request) return res.status(404).json({ error: "Request not found." });
        if (request.status !== "pending") return res.status(400).json({ error: "Request already processed." });

        request.status = "rejected";
        request.reviewedBy = req.admin._id;
        await request.save();

        res.json({ message: "Request rejected." });
    } catch (error) {
        res.status(500).json({ error: "Failed to reject request." });
    }
};
