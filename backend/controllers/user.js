import { User } from "../models/schema.js";

// Get all users with pagination and search
export const getAllUsers = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        const filter = {};

        if (search) {
            filter.$or = [
                { username: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await User.countDocuments(filter);

        const users = await User.find(filter)
            .select("-password") // Exclude password
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.status(200).json({
            users,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalUsers: total
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update user password (Admin only)
export const updateUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Directly setting password trigger the pre-save hook for hashing in schema.js
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
