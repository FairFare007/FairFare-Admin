import express from "express";
import { verifyAdmin } from "../middleware/authMiddleware.js";
import { login, getMe, changePassword, forgotPassword } from "../controllers/authController.js";
import { submitAccessRequest, getAccessRequests, approveAccessRequest, rejectAccessRequest, checkRequestStatus } from "../controllers/accessRequestController.js";
import { getActivityLogs } from "../controllers/activityLogController.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";
import {
    getMyPermissions,
    getAllAdmins,
    updatePermissions,
    promoteToSuperadmin,
    demoteFromSuperadmin,
    submitRequest,
    getRequests,
    approveRequest,
    rejectRequest
} from "../controllers/permissionController.js";

const router = express.Router();

// Public routes (no auth)
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/access-requests", submitAccessRequest);
router.post("/access-requests/status", checkRequestStatus);

// Protected routes (require admin login)
router.get("/me", verifyAdmin, getMe);
router.get("/access-requests", verifyAdmin, requirePermission("manage_access_requests"), getAccessRequests);
router.patch("/access-requests/:id/approve", verifyAdmin, requirePermission("manage_access_requests"), approveAccessRequest);
router.patch("/access-requests/:id/reject", verifyAdmin, requirePermission("manage_access_requests"), rejectAccessRequest);
router.get("/activity-logs", verifyAdmin, getActivityLogs);
router.post("/change-password", verifyAdmin, changePassword);

// Permission Management Routes
router.get("/permissions/my", verifyAdmin, getMyPermissions);
router.get("/permissions/admins", verifyAdmin, requirePermission("manage_permissions"), getAllAdmins);
router.patch("/permissions/admins/:adminId", verifyAdmin, requirePermission("manage_permissions"), updatePermissions);
router.patch("/permissions/admins/:adminId/promote", verifyAdmin, promoteToSuperadmin); // Controller handles superadmin check
router.patch("/permissions/admins/:adminId/demote", verifyAdmin, demoteFromSuperadmin);   // Controller handles superadmin check

router.post("/permissions/requests", verifyAdmin, submitRequest);
router.get("/permissions/requests", verifyAdmin, requirePermission("manage_permissions"), getRequests);
router.patch("/permissions/requests/:id/approve", verifyAdmin, requirePermission("manage_permissions"), approveRequest);
router.patch("/permissions/requests/:id/reject", verifyAdmin, requirePermission("manage_permissions"), rejectRequest);

export default router;
