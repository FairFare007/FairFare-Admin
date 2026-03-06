import mongoose from "mongoose";
import bcrypt from "bcrypt";

//Expense Schema
const expenseSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        amount: { type: Number, required: true },
        category: { type: String, default: null, index: true },
        subcategory: { type: String, default: null, index: true },
        paidBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        owedBy: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                amount: { type: Number, required: true },
            },
        ],
        group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" }, // optional, if expense is part of a group
    },
    { timestamps: true }
);

// Group schema
const groupSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        from: { type: Date },
        to: { type: Date },
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        tripTotal: { type: Number, default: 0 },
        expenses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Expense" }],
    },
    { timestamps: true }
);

// Friend Request Schema
const friendRequestSchema = new mongoose.Schema(
    {
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
    },
    { timestamps: true }
);

// User schema
const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true, select: false },
        fcmToken: { type: String, default: null },
        friends: [
            {
                friend: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                balance: { type: Number, default: 0 },
            },
        ],
        requests: { type: Number, default: 0 },
        groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
        recentExpense: [{ type: mongoose.Schema.Types.ObjectId, ref: "Expense" }],
        upiId: { type: String },
        aiChatUsage: {
            count: { type: Number, default: 0 },
            lastUsed: { type: Date, default: null },
        },
        profilePhotoUrl: { type: String, default: null }, // secure_url from Cloudinary
        profilePhotoId: { type: String, default: null }, // public_id used for deletion
        lastActive: { type: Date, default: null },
    },
    { timestamps: true }
);

//Label schema
const LabelCategorySchema = new mongoose.Schema({
    label: { type: String, unique: true, index: true },
    category: String,
    subcategory: String,
},
    { timestamps: true });

// Password hashing middleware
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

expenseSchema.index({ paidBy: 1, "owedBy.user": 1 });

const ticketSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        raisedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["Open", "Assigned", "Resolved", "Closed"],
            default: "Open",
        },
        severity: {
            type: String,
            enum: ["Low", "Medium", "High", "Critical"],
            default: "Medium",
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        tags: [{ type: String }],
    },
    { timestamps: true }
);

// Report Log schema (tracks daily report sends)
const reportLogSchema = new mongoose.Schema({
    reportDate: { type: String, required: true, unique: true }, // e.g. "2026-02-17"
    sentAt: { type: Date, default: Date.now },
    recipientCount: { type: Number, default: 0 },
    recipients: { type: [String], default: [] } // emails the report was sent to
});

// Admin User schema (for admin dashboard login - separate from app User)
const adminUserSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, select: false },
        name: { type: String, required: true, trim: true },
        role: { type: String, enum: ["superadmin", "admin"], default: "admin" },
        status: { type: String, enum: ["active", "suspended"], default: "active" },
        mustChangePassword: { type: Boolean, default: false },
        permissions: [{ type: String }], // Array of permission keys
    },
    { timestamps: true }
);

// Password hashing for AdminUser
adminUserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

adminUserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Access Request schema (pending requests from new users wanting admin access)
const accessRequestSchema = new mongoose.Schema(
    {
        requestId: { type: String, unique: true, sparse: true }, // Short unique ID for tracking
        email: { type: String, required: true, lowercase: true, trim: true },
        name: { type: String, required: true, trim: true },
        reason: { type: String, required: true },
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", default: null },
        tempPassword: { type: String, default: null }, // set when approved, hashed on the new AdminUser
    },
    { timestamps: true }
);

// Admin Activity Log schema (audit trail for all admin actions)
const adminActivityLogSchema = new mongoose.Schema(
    {
        admin: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", required: true },
        adminEmail: { type: String, required: true }, // denormalized for quick display
        action: { type: String, required: true }, // e.g. "LOGIN", "APPROVE_REQUEST", "REJECT_REQUEST", "SEND_NOTIFICATION"
        category: { type: String, enum: ["auth", "users", "tickets", "notifications", "system", "reports"], default: "system" },
        details: { type: String, default: "" }, // human-readable description
        metadata: { type: mongoose.Schema.Types.Mixed, default: {} }, // any extra structured data
        ip: { type: String, default: null },
    },
    { timestamps: true }
);

// Permission Request schema
const permissionRequestSchema = new mongoose.Schema(
    {
        admin: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", required: true },
        permission: { type: String, required: true },
        reason: { type: String, required: true },
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", default: null },
    },
    { timestamps: true }
);

adminActivityLogSchema.index({ createdAt: -1 });
adminActivityLogSchema.index({ admin: 1, createdAt: -1 });

const Expense = mongoose.model("Expense", expenseSchema);
const User = mongoose.model("User", userSchema);
const Group = mongoose.model("Group", groupSchema);
const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);
const LabelCategory = mongoose.model("LabelCategory", LabelCategorySchema);
const Ticket = mongoose.model("Ticket", ticketSchema);
const ReportLog = mongoose.model("ReportLog", reportLogSchema);
const AdminUser = mongoose.model("AdminUser", adminUserSchema);
const AccessRequest = mongoose.model("AccessRequest", accessRequestSchema);
const AdminActivityLog = mongoose.model("AdminActivityLog", adminActivityLogSchema);
const PermissionRequest = mongoose.model("PermissionRequest", permissionRequestSchema);

export { User, Group, Expense, FriendRequest, LabelCategory, Ticket, ReportLog, AdminUser, AccessRequest, AdminActivityLog, PermissionRequest };
