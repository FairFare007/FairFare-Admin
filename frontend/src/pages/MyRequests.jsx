import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    Shield,
    Clock,
    CheckCircle2,
    XCircle,
    Calendar,
    User,
    ArrowRight,
    Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout/Layout";

const ALL_PERMISSIONS = [
    { key: "manage_users", label: "Manage Users" },
    { key: "manage_tickets", label: "Manage Tickets" },
    { key: "send_campaigns", label: "Send Campaigns" },
    { key: "manage_access_requests", label: "Manage Access" },
    { key: "manage_permissions", label: "Manage Permissions" }
];

const MyRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get("/auth/permissions/requests/my");
            setRequests(res.data);
        } catch (err) {
            console.error("Failed to fetch my requests:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const getPermissionLabel = (key) => ALL_PERMISSIONS.find(p => p.key === key)?.label || key;

    const filteredRequests = requests.filter(req =>
        getPermissionLabel(req.permission).toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.reason.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const StatusBadge = ({ status }) => {
        const styles = {
            pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
            approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            rejected: "bg-red-500/10 text-red-400 border-red-500/20"
        };
        const icons = {
            pending: <Clock size={12} />,
            approved: <CheckCircle2 size={12} />,
            rejected: <XCircle size={12} />
        };
        return (
            <span className={`flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full border font-bold uppercase tracking-wider ${styles[status]}`}>
                {icons[status]}
                {status}
            </span>
        );
    };

    return (
        <Layout>
            <div className="p-4 md:p-8 max-w-5xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col gap-6 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <button
                            onClick={() => navigate("/request-permissions")}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-fit group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                                <ChevronLeft size={18} />
                            </div>
                            <span className="font-semibold text-sm">Back to Form</span>
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                <Clock size={28} />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">My Requests</h1>
                                <p className="text-slate-500 text-sm">Track your permission applications</p>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search requests by permission or reason..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/30 transition-all text-sm"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                        <p className="text-slate-500 font-medium animate-pulse">Loading requests...</p>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-white/5"
                    >
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                            <Shield size={32} />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-1">No requests found</h3>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto">
                            {searchTerm ? "Try adjusting your search term to find what you're looking for." : "You haven't submitted any permission requests yet."}
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence mode="popLayout">
                            {filteredRequests.map((req, index) => (
                                <motion.div
                                    key={req._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group bg-slate-900/40 border border-white/5 rounded-3xl p-5 hover:border-white/10 transition-all relative overflow-hidden"
                                >
                                    {/* Background Accent */}
                                    <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-5 -z-10 ${req.status === 'approved' ? 'bg-emerald-500' :
                                            req.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'
                                        }`} />

                                    <div className="flex flex-col h-full">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                                    <Shield size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-bold text-base leading-tight">
                                                        {getPermissionLabel(req.permission)}
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-slate-500 text-[10px] mt-1 uppercase tracking-widest font-semibold">
                                                        <Calendar size={10} />
                                                        {new Date(req.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <StatusBadge status={req.status} />
                                        </div>

                                        <div className="bg-black/20 rounded-2xl p-4 mb-4 flex-grow border border-white/5 ring-1 ring-inset ring-white/5">
                                            <p className="text-slate-400 text-sm italic leading-relaxed">
                                                "{req.reason}"
                                            </p>
                                        </div>

                                        {req.reviewedBy && (
                                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <User size={12} />
                                                    <span className="text-[11px] font-medium">Reviewer</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-white bg-white/5 px-2.5 py-1 rounded-lg">
                                                    <span className="text-sm font-bold">{req.reviewedBy.name}</span>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                </div>
                                            </div>
                                        )}

                                        {req.status === 'pending' && (
                                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Clock size={12} />
                                                    <span className="text-[11px] font-medium italic">Awaiting Review</span>
                                                </div>
                                                <div className="animate-pulse flex gap-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40" />
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40" />
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default MyRequests;
