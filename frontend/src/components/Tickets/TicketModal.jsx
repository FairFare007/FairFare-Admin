import React, { useState } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const TicketModal = ({ isOpen, onClose, onTicketCreated, initialTicket = null }) => {
    const { admin } = useAuth();
    const isReadOnly = initialTicket && admin.role !== "superadmin" && initialTicket.assignedTo?.email !== admin.email;
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        severity: "Medium",
        status: "Open",
        assignedTo: "",
        raisedBy: "696be1b259307c34a9edd5cb" // Admin User ID
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    React.useEffect(() => {
        if (isOpen) {
            fetchUsers();
            if (initialTicket) {
                setFormData({
                    title: initialTicket.title,
                    description: initialTicket.description,
                    severity: initialTicket.severity,
                    status: initialTicket.status,
                    assignedTo: initialTicket.assignedTo?._id || "",
                    raisedBy: initialTicket.raisedBy?._id || "696be1b259307c34a9edd5cb"
                });
            } else {
                setFormData({
                    title: "",
                    description: "",
                    severity: "Medium",
                    status: "Open",
                    assignedTo: "",
                    raisedBy: "696be1b259307c34a9edd5cb"
                });
            }
        }
    }, [isOpen, initialTicket]);

    const fetchUsers = async () => {
        try {
            const res = await api.get("/tickets/users");
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (initialTicket) {
                await api.patch(`/tickets/${initialTicket._id}`, formData);
            } else {
                await api.post("/tickets", formData);
            }
            onTicketCreated();
            onClose();
        } catch (err) {
            console.error("Failed to save ticket", err);
            setError("Failed to save ticket. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
                <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
                    <h2 className="text-xl font-bold text-white">{initialTicket ? "Edit Ticket" : "Create New Ticket"}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-600 disabled:opacity-60"
                            placeholder="Brief summary of the issue"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Severity</label>
                            <select
                                name="severity"
                                value={formData.severity}
                                onChange={handleChange}
                                disabled={isReadOnly}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500/50 transition-colors disabled:opacity-60"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                disabled={isReadOnly}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500/50 transition-colors disabled:opacity-60"
                            >
                                <option value="Open">Open</option>
                                <option value="Assigned">Assigned</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Assign To</label>
                        <select
                            name="assignedTo"
                            value={formData.assignedTo}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500/50 transition-colors disabled:opacity-60"
                        >
                            <option value="">Unassigned</option>
                            {users.map(user => (
                                <option key={user._id} value={user._id}>
                                    {user.username} ({user.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                        <textarea
                            name="description"
                            required
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-600 resize-none disabled:opacity-60"
                            placeholder="Detailed explanation of the problem..."
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || (initialTicket && admin.role !== "superadmin" && initialTicket.assignedTo?.email !== admin.email)}
                            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title={initialTicket && admin.role !== "superadmin" && initialTicket.assignedTo?.email !== admin.email ? "Read-only access" : ""}
                        >
                            {loading ? "Saving..." : (
                                <>
                                    <Save size={18} />
                                    {initialTicket ? "Update Ticket" : "Create Ticket"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default TicketModal;
