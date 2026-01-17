import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Key } from "lucide-react";
import api from "../../services/api";

const ChangePasswordModal = ({ isOpen, onClose, user, onSuccess }) => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!window.confirm(`Are you sure you want to change the password for ${user.username}?`)) {
            return;
        }

        setLoading(true);
        try {
            await api.patch(`/users/${user._id}/password`, { newPassword });
            setNewPassword("");
            setConfirmPassword("");
            onSuccess();
            onClose();
            alert("Password updated successfully.");
        } catch (err) {
            console.error("Failed to update password", err);
            setError(err.response?.data?.message || "Failed to update password.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                    <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-800/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                                <Lock size={20} />
                            </div>
                            <h3 className="text-lg font-semibold text-white">Change Password</h3>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="mb-4">
                            <p className="text-sm text-slate-400">
                                Update password for <span className="font-bold text-white">{user?.username}</span>
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">New Password</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min 6 characters"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Confirm Password</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Updating..." : "Update Password"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ChangePasswordModal;
