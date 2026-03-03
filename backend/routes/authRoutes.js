import express from "express";
import { verifyAdmin } from "../middleware/authMiddleware.js";
import { login, getMe, changePassword } from "../controllers/authController.js";
import { submitAccessRequest, getAccessRequests, approveAccessRequest, rejectAccessRequest, checkRequestStatus } from "../controllers/accessRequestController.js";
import { getActivityLogs } from "../controllers/activityLogController.js";

const router = express.Router();

// Public routes (no auth)
router.post("/login", login);
router.post("/access-requests", submitAccessRequest);
router.post("/access-requests/status", checkRequestStatus);

// Protected routes (require admin login)
router.get("/me", verifyAdmin, getMe);
router.get("/access-requests", verifyAdmin, getAccessRequests);
router.patch("/access-requests/:id/approve", verifyAdmin, approveAccessRequest);
router.patch("/access-requests/:id/reject", verifyAdmin, rejectAccessRequest);
router.get("/activity-logs", verifyAdmin, getActivityLogs);
router.post("/change-password", verifyAdmin, changePassword);

export default router;
