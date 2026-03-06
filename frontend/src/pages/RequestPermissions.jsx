import React, { useState } from "react";
import { Shield, Send, CheckCircle2, Clock, Info, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import Layout from "../components/Layout/Layout";

const AVAILABLE_PERMISSIONS = [
    { key: "manage_users", label: "Manage Users", description: "Change user passwords and basic info" },
    { key: "manage_tickets", label: "Manage Tickets", description: "Assign, update, and resolve support tickets" },
    { key: "send_campaigns", label: "Send Campaigns", description: "Send bulk emails and push notifications" },
    { key: "manage_access_requests", label: "Manage Access", description: "Approve or reject new admin applications" },
    { key: "manage_permissions", label: "Manage Permissions", description: "Grant/revoke rights for other admins" },
];

const RequestPermissions = () => {
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const togglePermission = (key) => {
        if (selectedPermissions.includes(key)) {
            setSelectedPermissions(selectedPermissions.filter(p => p !== key));
        } else {
            setSelectedPermissions([...selectedPermissions, key]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedPermissions.length === 0) {
            setError("Please select at least one permission.");
            return;
        }
        if (!reason.trim()) {
            setError("Please provide a reason for your request.");
            return;
        }

        setLoading(true);
        setError("");
        try {
            // Send requests one by one if multiple are selected (backend handles one per request)
            await Promise.all(
                selectedPermissions.map(permission => 
                    api.post("/auth/permissions/requests", { permission, reason })
                )
            );
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to submit request. You might already have a pending request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="p-6 max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Request Permissions</h1>
                    <p className="text-slate-400">Select the access rights you need and provide a justification for the Superadmin to review.</p>
                </div>

                <AnimatePresence mode="wait">
                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-12 text-center"
                        >
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={40} className="text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Request Submitted!</h2>
                            <p className="text-slate-400 mb-8 max-w-md mx-auto">
                                Your permission request has been sent to the Superadmins. You'll be notified once it's reviewed.
                            </p>
                            <button
                                onClick={() => {
                                    setSuccess(false);
                                    setSelectedPermissions([]);
                                    setReason("");
                                }}
                                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20"
                            >
                                Raise Another Request
                            </button>
                        </motion.div>
                    ) : (
                        <motion.form
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            onSubmit={handleSubmit}
                            className="space-y-8"
                        >
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center gap-3">
                                    <AlertCircle size={20} />
                                    <p className="text-sm font-medium">{error}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {AVAILABLE_PERMISSIONS.map((perm) => (
                                    <button
                                        type="button"
                                        key={perm.key}
                                        onClick={() => togglePermission(perm.key)}
                                        className={`flex items-start gap-4 p-5 rounded-2xl border transition-all text-left group ${
                                            selectedPermissions.includes(perm.key)
                                                ? "bg-indigo-600/10 border-indigo-500/40 ring-1 ring-indigo-500/20 shadow-xl shadow-indigo-500/5"
                                                : "bg-slate-900/40 border-white/5 hover:border-white/10"
                                        }`}
                                    >
                                        <div className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                                            selectedPermissions.includes(perm.key)
                                                ? "bg-indigo-600 border-indigo-600 text-white scale-110"
                                                : "bg-slate-800 border-white/10 group-hover:border-white/20"
                                        }`}>
                                            {selectedPermissions.includes(perm.key) && <CheckCircle2 size={14} />}
                                        </div>
                                        <div>
                                            <p className={`text-lg font-bold transition-colors ${selectedPermissions.includes(perm.key) ? "text-white" : "text-slate-300"}`}>
                                                {perm.label}
                                            </p>
                                            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                                {perm.description}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest">
                                    <Info size={16} />
                                    Reason for Access
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Explain why you need these permissions..."
                                    className="w-full bg-slate-800/50 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all min-h-[150px] resize-none"
                                    required
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-3 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/20 group"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            Submit Requests
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </Layout>
    );
};

export default RequestPermissions;
