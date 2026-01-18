import React, { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import api from "../services/api";
import { Plus, Search, Filter, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TicketModal from "../components/Tickets/TicketModal";

const Tickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [stats, setStats] = useState({ total: 0, open: 0, resolved: 0, critical: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setPage(1); // Reset to page 1 on new search/filter
            fetchTickets(1);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, filterStatus]);

    useEffect(() => {
        fetchTickets(page);
    }, [page]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchTickets = async (currentPage = 1) => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: 10,
                search: searchTerm
            };
            if (filterStatus !== "All") params.status = filterStatus;

            const res = await api.get("/tickets", { params });
            // Handle both old array format (fallback) and new object format
            if (Array.isArray(res.data)) {
                setTickets(res.data);
                setTotalPages(1);
            } else {
                setTickets(res.data.tickets || []);
                setTotalPages(res.data.totalPages || 1);
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
            setTickets([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get("/ticket-stats");
            setStats(res.data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const handleEdit = (ticket) => {
        setSelectedTicket(ticket);
        setIsModalOpen(true);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this ticket?")) {
            try {
                await api.delete(`/tickets/${id}`);
                fetchTickets(page); // Refresh current page
                fetchStats();
            } catch (error) {
                console.error("Error deleting ticket:", error);
            }
        }
    };

    const handleCreateNew = () => {
        setSelectedTicket(null);
        setIsModalOpen(true);
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            Open: "bg-blue-500/10 text-blue-400 border-blue-500/20",
            Assigned: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
            Resolved: "bg-green-500/10 text-green-400 border-green-500/20",
            Closed: "bg-slate-500/10 text-slate-400 border-slate-500/20",
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.Open}`}>
                {status}
            </span>
        );
    };

    const SeverityBadge = ({ severity }) => {
        const styles = {
            Low: "text-slate-400",
            Medium: "text-yellow-400",
            High: "text-orange-400",
            Critical: "text-red-500 font-bold",
        };
        return <span className={`text-xs ${styles[severity]}`}>{severity} Priority</span>;
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Ticket Management</h2>
                    <p className="text-slate-400">Track and resolve user issues and support requests.</p>
                </div>
                <button
                    onClick={handleCreateNew}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/20 font-medium"
                >
                    <Plus size={18} />
                    New Ticket
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Total Tickets", value: stats.total, color: "text-white" },
                    { label: "Open Issues", value: stats.open, color: "text-blue-400" },
                    { label: "Resolved", value: stats.resolved, color: "text-green-400" },
                    { label: "Critical", value: stats.critical, color: "text-red-500" },
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-4 rounded-xl">
                        <p className="text-slate-500 text-sm mb-1">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search tickets..."
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {["All", "Open", "Assigned", "Resolved"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === status
                                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                                : "bg-slate-900/50 text-slate-400 border border-white/5 hover:bg-slate-800"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tickets List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-slate-500">Loading tickets...</div>
                ) : tickets.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 glass-card rounded-2xl border-dashed border-slate-800">
                        No tickets found matching your criteria.
                    </div>
                ) : (
                    <AnimatePresence>
                        {tickets.map((ticket, i) => (
                            <motion.div
                                key={ticket._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => handleEdit(ticket)}
                                className="glass-card p-4 md:p-6 rounded-xl group hover:border-indigo-500/30 transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">
                                                {ticket.title}
                                            </h3>
                                            <StatusBadge status={ticket.status} />
                                        </div>
                                        <p className="text-slate-400 text-sm line-clamp-2 md:line-clamp-1 mb-3">
                                            {ticket.description}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <AlertCircle size={12} />
                                                <SeverityBadge severity={ticket.severity} />
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(ticket.createdAt).toLocaleDateString()}
                                            </span>
                                            <span>Raised by: {ticket.raisedBy?.username || "Unknown"}</span>
                                            {ticket.assignedTo && (
                                                <span className="text-indigo-400">Assigned to: {ticket.assignedTo.username}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleEdit(ticket); }}
                                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm border border-white/5 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, ticket._id)}
                                            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm border border-red-500/20 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center flex-wrap gap-2 mt-8">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                    >
                        Previous
                    </button>
                    <span className="flex items-center px-4 py-2 rounded-lg bg-slate-800/50 text-slate-300 border border-white/5 text-sm">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}

            <TicketModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialTicket={selectedTicket}
                onTicketCreated={() => {
                    fetchTickets(page);
                    fetchStats();
                    setIsModalOpen(false);
                }}
            />
        </Layout>
    );
};

export default Tickets;
