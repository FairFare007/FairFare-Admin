import mongoose from "mongoose";
import { AdminUser, AccessRequest, User } from "../models/schema.js";
import { logActivity } from "../utils/activityLogger.js";
import { sendMail } from "../utils/mailClient.js";
import { buildApprovalEmail, buildRejectionEmail, buildSubmissionEmail } from "../utils/accessRequestEmails.js";

/**
 * POST /auth/access-requests
 * Submit a new access request (public, no auth needed).
 */
export const submitAccessRequest = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { email, name, reason } = req.body;
        if (!email || !name || !reason) {
            return res.status(400).json({ error: "Email, name, and reason are required." });
        }

        let requestId;
        await session.withTransaction(async () => {
            const normalizedEmail = email.toLowerCase().trim();

            const existingAdmin = await AdminUser.findOne({ email: normalizedEmail }).session(session);
            if (existingAdmin) {
                throw new Error("ALREADY_ADMIN");
            }

            const fairfareUser = await User.findOne({ email: normalizedEmail }).session(session);
            if (!fairfareUser) {
                throw new Error("NO_USER_ACCOUNT");
            }

            const existingRequest = await AccessRequest.findOne({
                email: normalizedEmail,
                status: "pending",
            }).session(session);
            if (existingRequest) {
                throw new Error("PENDING_EXISTS");
            }

            // Generate a short unique tracking ID (e.g., FF-A1B2C)
            requestId = "FF-" + Math.random().toString(36).substring(2, 7).toUpperCase();

            await AccessRequest.create(
                [
                    {
                        requestId,
                        email: normalizedEmail,
                        name: fairfareUser.username, // Use username from FairFare app
                        reason,
                    },
                ],
                { session }
            );
        });
 
        // Send confirmation email asynchronously
        const emailContent = buildSubmissionEmail({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            requestId,
        });
        sendMail({ to: email.toLowerCase().trim(), ...emailContent }).catch((err) => {
            console.error("[ACCESS REQUEST] Failed to send submission confirmation email:", err.message);
        });

        res.status(201).json({ 
            message: "Access request submitted successfully. Please save your Request ID for tracking.",
            requestId 
        });
    } catch (error) {
        if (error.message === "ALREADY_ADMIN") {
            return res.status(400).json({ error: "An account with this email already exists." });
        }
        if (error.message === "NO_USER_ACCOUNT") {
            return res.status(403).json({ 
                error: "FairFare Account Required",
                code: "NO_USER_ACCOUNT",
                message: "You must have a regular FairFare account before applying for admin access." 
            });
        }
        if (error.message === "PENDING_EXISTS") {
            return res.status(400).json({ error: "You already have a pending access request." });
        }
        console.error("[ACCESS REQUEST] Submit error:", error.message);
        res.status(500).json({ error: "Failed to submit access request." });
    } finally {
        session.endSession();
    }
};

/**
 * POST /auth/access-requests/status
 * Check the status of an access request by email and Request ID (public, no auth needed).
 */
export const checkRequestStatus = async (req, res) => {
    try {
        const { email, requestId } = req.body;
        if (!email || !requestId) {
            return res.status(400).json({ error: "Email and Request ID are required." });
        }

        const request = await AccessRequest.findOne({
            email: email.toLowerCase().trim(),
            requestId: requestId.toUpperCase().trim(),
        });

        if (!request) {
            return res.status(404).json({ error: "Invalid email or Request ID combination." });
        }

        const response = {
            status: request.status,
            name: request.name,
            submittedAt: request.createdAt,
            updatedAt: request.updatedAt,
        };

        if (request.status === "approved") {
            response.message = "Your access has been approved! Check your email for login credentials.";
        } else if (request.status === "rejected") {
            response.message = "Your request was not approved. Please contact an admin before reapplying.";
        } else {
            response.message = "Your request is being reviewed. You'll receive an email once a decision is made.";
        }

        res.json(response);
    } catch (error) {
        console.error("[ACCESS REQUEST] Status check error:", error.message);
        res.status(500).json({ error: "Failed to check request status." });
    }
};

/**
 * GET /auth/access-requests
 * List all access requests (admin only).
 */
export const getAccessRequests = async (req, res) => {
    try {
        const requests = await AccessRequest.find()
            .populate("reviewedBy", "name email")
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        console.error("[ACCESS REQUEST] Fetch error:", error.message);
        res.status(500).json({ error: "Failed to fetch access requests." });
    }
};

/**
 * PATCH /auth/access-requests/:id/approve
 * Approve an access request → creates AdminUser with temp password + sends welcome email.
 */
export const approveAccessRequest = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { id } = req.params;
        const tempPassword = "TempPass@" + Math.random().toString(36).slice(-6);

        await session.withTransaction(async () => {
            const request = await AccessRequest.findById(id).session(session);
            if (!request) {
                throw new Error("NOT_FOUND");
            }
            if (request.status !== "pending") {
                throw new Error(`ALREADY_${request.status.toUpperCase()}`);
            }

            await AdminUser.create(
                [
                    {
                        email: request.email,
                        password: tempPassword,
                        name: request.name,
                        role: "admin",
                        status: "active",
                        mustChangePassword: true,
                    },
                ],
                { session }
            );

            request.status = "approved";
            request.reviewedBy = req.admin._id;
            request.tempPassword = tempPassword;
            await request.save({ session });

            await logActivity(
                req.admin,
                "APPROVE_ACCESS_REQUEST",
                "auth",
                `Approved access request from ${request.name} (${request.email})`,
                { requestId: request._id, approvedEmail: request.email },
                req.ip,
                session
            );

            // Send welcome email with credentials
            const emailContent = buildApprovalEmail({
                name: request.name,
                email: request.email,
                tempPassword,
            });
            sendMail({ to: request.email, ...emailContent }).catch((err) => {
                console.error("[ACCESS REQUEST] Failed to send approval email:", err.message);
            });
        });

        res.json({
            message: `Access approved for the user`,
            tempPassword,
        });
    } catch (error) {
        if (error.message === "NOT_FOUND") {
            return res.status(404).json({ error: "Access request not found." });
        }
        if (error.message.startsWith("ALREADY_")) {
            return res.status(400).json({ error: `Request already processed.` });
        }
        console.error("[ACCESS REQUEST] Approve error:", error.message);
        res.status(500).json({ error: "Failed to approve access request." });
    } finally {
        session.endSession();
    }
};

/**
 * PATCH /auth/access-requests/:id/reject
 * Reject an access request + sends rejection email.
 */
export const rejectAccessRequest = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { id } = req.params;

        await session.withTransaction(async () => {
            const request = await AccessRequest.findById(id).session(session);
            if (!request) {
                throw new Error("NOT_FOUND");
            }
            if (request.status !== "pending") {
                throw new Error(`ALREADY_${request.status.toUpperCase()}`);
            }

            request.status = "rejected";
            request.reviewedBy = req.admin._id;
            await request.save({ session });

            await logActivity(
                req.admin,
                "REJECT_ACCESS_REQUEST",
                "auth",
                `Rejected access request from ${request.name} (${request.email})`,
                { requestId: request._id, rejectedEmail: request.email },
                req.ip,
                session
            );

            // Send rejection email
            const emailContent = buildRejectionEmail({
                name: request.name,
                email: request.email,
            });
            sendMail({ to: request.email, ...emailContent }).catch((err) => {
                console.error("[ACCESS REQUEST] Failed to send rejection email:", err.message);
            });
        });

        res.json({ message: `Access request rejected.` });
    } catch (error) {
        if (error.message === "NOT_FOUND") {
            return res.status(404).json({ error: "Access request not found." });
        }
        if (error.message.startsWith("ALREADY_")) {
            return res.status(400).json({ error: `Request already processed.` });
        }
        console.error("[ACCESS REQUEST] Reject error:", error.message);
        res.status(500).json({ error: "Failed to reject access request." });
    } finally {
        session.endSession();
    }
};
