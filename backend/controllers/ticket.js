import { Ticket, User } from "../models/schema.js";

// Create a new ticket
export const createTicket = async (req, res) => {
    try {
        const { title, description, raisedBy, severity, tags, assignedTo, status } = req.body;

        if (!title || !description || !raisedBy) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const ticket = new Ticket({
            title,
            description,
            raisedBy,
            severity: severity || "Medium",
            tags: tags || [],
            assignedTo: assignedTo || null,
            status: status || "Open"
        });

        await ticket.save();
        res.status(201).json({ message: "Ticket created successfully", ticket });
    } catch (error) {
        console.error("Error creating ticket:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all tickets with filters, search, and pagination
export const getAllTickets = async (req, res) => {
    try {
        const { status, severity, search, page = 1, limit = 10 } = req.query;
        const filter = {};

        if (status && status !== "All") filter.status = status;
        if (severity) filter.severity = severity;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Ticket.countDocuments(filter);

        const tickets = await Ticket.find(filter)
            .populate("raisedBy", "username email profilePhotoUrl")
            .populate("assignedTo", "username email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.status(200).json({
            tickets,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalTickets: total
        });
    } catch (error) {
        console.error("Error fetching tickets:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update ticket status/severity/assignment
export const updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const ticket = await Ticket.findByIdAndUpdate(id, updates, { new: true })
            .populate("raisedBy", "username email")
            .populate("assignedTo", "username email");

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        res.status(200).json({ message: "Ticket updated", ticket });
    } catch (error) {
        console.error("Error updating ticket:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete ticket
export const deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await Ticket.findByIdAndDelete(id);

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        res.status(200).json({ message: "Ticket deleted successfully" });
    } catch (error) {
        console.error("Error deleting ticket:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get stats for tickets
export const getTicketStats = async (req, res) => {
    try {
        const total = await Ticket.countDocuments();
        const open = await Ticket.countDocuments({ status: "Open" });
        const resolved = await Ticket.countDocuments({ status: "Resolved" });
        const critical = await Ticket.countDocuments({ severity: "Critical" });

        res.status(200).json({ total, open, resolved, critical });
    } catch (error) {
        console.error("Error fetching ticket stats:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// Get suitable users for assignment (e.g., admins or support staff) - simplified to all users for now
export const getUsersForAssignment = async (req, res) => {
    try {
        const users = await User.find({}, "username email profilePhotoUrl");
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users for assignment:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
