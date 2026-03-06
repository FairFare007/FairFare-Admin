import React, { useState } from "react";
import { ShieldAlert, Send, CheckCircle2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

const NoAccess = () => {
    const location = useLocation();
    const [requesting, setRequesting] = useState(false);
    const [reason, setReason] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    // Map common paths to permission keys for easier requesting
    const pathPermissionMap = {
        "/users": "manage_users",
        "/tickets": "manage_tickets",
        "/campaigns": "send_campaigns",
        "/access-requests": "manage_access_requests",
        "/activity-logs": "view_activity_logs", // although user said logs are for all, implementation might gate it if changed
    };

    const targetPermission = pathPermissionMap[location.pathname] || "unknown_permission";

    const handleRequestAccess = async (e) => {
        e.preventDefault();
        if (!reason.trim()) return;

        setRequesting(true);
        setError("");
        try {
            await api.post("/auth/permissions/requests", {
                permission: targetPermission,
                reason: reason.trim()
            });
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to submit request.");
        } finally {
            setRequesting(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 text-center shadow-2xl"
            >
                <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert size={40} className="text-red-400" />
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                <p className="text-slate-400 mb-8">
                    You don't have the required permission to access this page.
                </p>

                <AnimatePresence mode="wait">
                    {!submitted ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <form onSubmit={handleRequestAccess} className="space-y-4">
                                <div className="text-left">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                                        Request Access to: <span className="text-blue-400">{targetPermission}</span>
                                    </label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Why do you need this access?"
                                        className="w-full mt-2 bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none h-32"
                                        required
                                    />
                                </div>

                                {error && (
                                    <p className="text-red-400 text-sm bg-red-400/10 py-2 rounded-lg border border-red-400/20">
                                        {error}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={requesting || !reason.trim()}
                                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    {requesting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Request Permission
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6"
                        >
                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={24} className="text-green-400" />
                            </div>
                            <h3 className="text-green-400 font-bold mb-1">Request Submitted</h3>
                            <p className="text-slate-400 text-sm mb-4">
                                Your request for <span className="text-blue-400">{targetPermission}</span> has been sent to a superadmin for review.
                            </p>
                            <Link
                                to="/"
                                className="inline-block text-white bg-slate-800 hover:bg-slate-700 px-6 py-2 rounded-xl transition-colors font-medium"
                            >
                                Back to Dashboard
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-8 pt-6 border-t border-white/5">
                    <Link to="/" className="text-slate-500 hover:text-white transition-colors text-sm">
                        Go back to Dashboard
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default NoAccess;
