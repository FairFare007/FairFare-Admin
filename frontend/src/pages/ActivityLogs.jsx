import { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import api from "../services/api";
import { Search, Clock, Activity, Shield, User, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ACTION_ICONS = {
    LOGIN: Shield,
    APPROVE_ACCESS_REQUEST: User,
    REJECT_ACCESS_REQUEST: User,
    default: Activity,
};

const ACTION_COLORS = {
    LOGIN: "text-blue-400 bg-blue-500/10",
    APPROVE_ACCESS_REQUEST: "text-green-400 bg-green-500/10",
    REJECT_ACCESS_REQUEST: "text-red-400 bg-red-500/10",
    default: "text-indigo-400 bg-indigo-500/10",
};

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

    useEffect(() => {
        fetchLogs(page);
    }, [page]);

    const fetchLogs = async (currentPage = 1) => {
        setLoading(true);
        try {
            const res = await api.get("/auth/activity-logs", {
                params: { page: currentPage, limit: 30 },
            });
            setLogs(res.data.logs || []);
            setPagination(res.data.pagination || { total: 0, totalPages: 1 });
        } catch (error) {
            console.error("Error fetching activity logs:", error);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter((log) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            log.action?.toLowerCase().includes(term) ||
            log.description?.toLowerCase().includes(term) ||
            log.admin?.name?.toLowerCase().includes(term) ||
            log.admin?.email?.toLowerCase().includes(term) ||
            log.module?.toLowerCase().includes(term)
        );
    });

    const getIcon = (action) => {
        const Icon = ACTION_ICONS[action] || ACTION_ICONS.default;
        return Icon;
    };

    const getColor = (action) => {
        return ACTION_COLORS[action] || ACTION_COLORS.default;
    };

    const formatAction = (action) => {
        return action?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Unknown";
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Activity Logs</h2>
                    <p className="text-slate-400">Audit trail of all admin actions.</p>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Activity size={16} />
                    <span>{pagination.total} total events</span>
                </div>
            </div>

            {/* Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search logs by action, description, admin..."
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Logs List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-12 text-slate-500">Loading activity logs...</div>
                ) : filteredLogs.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 glass-card rounded-2xl border-dashed border-slate-800">
                        No activity logs found.
                    </div>
                ) : (
                    <AnimatePresence>
                        {filteredLogs.map((log, i) => {
                            const Icon = getIcon(log.action);
                            const colorClass = getColor(log.action);
                            return (
                                <motion.div
                                    key={log._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="glass-card p-4 rounded-xl group hover:border-indigo-500/30 transition-all relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                            <Icon size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span className="text-sm font-semibold text-slate-200">
                                                    {formatAction(log.action)}
                                                </span>
                                                {log.module && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-400 border border-white/5">
                                                        {log.module}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-slate-400 text-sm line-clamp-2">
                                                {log.description}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                                                <span className="flex items-center gap-1">
                                                    <User size={12} />
                                                    {log.admin?.name || log.admin?.email || "System"}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </span>
                                                {log.ipAddress && (
                                                    <span className="text-slate-600">
                                                        IP: {log.ipAddress}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center flex-wrap gap-2 mt-8">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                    >
                        Previous
                    </button>
                    <span className="flex items-center px-4 py-2 rounded-lg bg-slate-800/50 text-slate-300 border border-white/5 text-sm">
                        Page {page} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages}
                        className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}
        </Layout>
    );
};

export default ActivityLogs;
