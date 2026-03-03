import { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import api from "../services/api";
import { Search, CheckCircle, XCircle, Clock, UserPlus, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AccessRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [actionLoading, setActionLoading] = useState(null);
    const [tempPasswords, setTempPasswords] = useState({});

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get("/auth/access-requests");
            setRequests(res.data);
        } catch (error) {
            console.error("Error fetching access requests:", error);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        setActionLoading(id);
        try {
            const res = await api.patch(`/auth/access-requests/${id}/approve`);
            setTempPasswords((prev) => ({ ...prev, [id]: res.data.tempPassword }));
            fetchRequests();
        } catch (error) {
            console.error("Error approving request:", error);
            alert(error.response?.data?.error || "Failed to approve request.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Are you sure you want to reject this access request?")) return;
        setActionLoading(id);
        try {
            await api.patch(`/auth/access-requests/${id}/reject`);
            fetchRequests();
        } catch (error) {
            console.error("Error rejecting request:", error);
            alert(error.response?.data?.error || "Failed to reject request.");
        } finally {
            setActionLoading(null);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const filteredRequests = requests.filter((req) => {
        const matchesStatus = filterStatus === "All" || req.status === filterStatus.toLowerCase();
        const matchesSearch =
            req.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const stats = {
        total: requests.length,
        pending: requests.filter((r) => r.status === "pending").length,
        approved: requests.filter((r) => r.status === "approved").length,
        rejected: requests.filter((r) => r.status === "rejected").length,
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
            approved: "bg-green-500/10 text-green-400 border-green-500/20",
            rejected: "bg-red-500/10 text-red-400 border-red-500/20",
        };
        const icons = {
            pending: <Clock size={12} />,
            approved: <CheckCircle size={12} />,
            rejected: <XCircle size={12} />,
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${styles[status] || styles.pending}`}>
                {icons[status]}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Access Requests</h2>
                    <p className="text-slate-400">Review and manage admin access requests.</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Total Requests", value: stats.total, color: "text-white" },
                    { label: "Pending", value: stats.pending, color: "text-yellow-400" },
                    { label: "Approved", value: stats.approved, color: "text-green-400" },
                    { label: "Rejected", value: stats.rejected, color: "text-red-400" },
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
                        placeholder="Search by name or email..."
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {["All", "Pending", "Approved", "Rejected"].map((status) => (
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

            {/* Requests List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-slate-500">Loading access requests...</div>
                ) : filteredRequests.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 glass-card rounded-2xl border-dashed border-slate-800">
                        No access requests found.
                    </div>
                ) : (
                    <AnimatePresence>
                        {filteredRequests.map((request, i) => (
                            <motion.div
                                key={request._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card p-4 md:p-6 rounded-xl group hover:border-indigo-500/30 transition-all relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                <UserPlus size={18} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-200">{request.name}</h3>
                                                <p className="text-slate-400 text-sm">{request.email}</p>
                                            </div>
                                            <StatusBadge status={request.status} />
                                        </div>
                                        <p className="text-slate-400 text-sm mt-2 ml-[52px]">
                                            <span className="text-slate-500">Reason: </span>{request.reason}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 ml-[52px]">
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(request.createdAt).toLocaleString()}
                                            </span>
                                            {request.reviewedBy && (
                                                <span>
                                                    Reviewed by: {request.reviewedBy.name || request.reviewedBy.email}
                                                </span>
                                            )}
                                        </div>
                                        {/* Show temp password after approval */}
                                        {tempPasswords[request._id] && (
                                            <div className="mt-3 ml-[52px] p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                                <p className="text-green-400 text-sm font-medium mb-1">Temporary Password Created:</p>
                                                <div className="flex items-center gap-2">
                                                    <code className="text-green-300 bg-green-500/10 px-2 py-1 rounded text-sm">
                                                        {tempPasswords[request._id]}
                                                    </code>
                                                    <button
                                                        onClick={() => copyToClipboard(tempPasswords[request._id])}
                                                        className="p-1 rounded hover:bg-green-500/20 text-green-400 transition-colors"
                                                        title="Copy password"
                                                    >
                                                        <Copy size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {request.status === "pending" && (
                                        <div className="flex items-center gap-2 ml-[52px] md:ml-0">
                                            <button
                                                onClick={() => handleApprove(request._id)}
                                                disabled={actionLoading === request._id}
                                                className="px-4 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm border border-green-500/20 transition-colors disabled:opacity-50 flex items-center gap-1"
                                            >
                                                <CheckCircle size={14} />
                                                {actionLoading === request._id ? "..." : "Approve"}
                                            </button>
                                            <button
                                                onClick={() => handleReject(request._id)}
                                                disabled={actionLoading === request._id}
                                                className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm border border-red-500/20 transition-colors disabled:opacity-50 flex items-center gap-1"
                                            >
                                                <XCircle size={14} />
                                                {actionLoading === request._id ? "..." : "Reject"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </Layout>
    );
};

export default AccessRequests;
