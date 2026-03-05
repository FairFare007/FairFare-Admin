import { useState, useEffect, useMemo } from "react";
import api from "../services/api";
import { Mail, Send, AlertCircle, CheckCircle, Loader2, Search, X, Users, UserCheck, CheckSquare, Square, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EmailCampaigns = () => {
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState(null);
    const [email, setEmail] = useState({ title: "", body: "" });
    const [showConfirm, setShowConfirm] = useState(false);

    // User selection state
    const [sendMode, setSendMode] = useState("all"); // "all" | "selected"
    const [allUsers, setAllUsers] = useState([]);
    const [selectedEmails, setSelectedEmails] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Fetch users when switching to "selected" mode
    useEffect(() => {
        if (sendMode === "selected" && allUsers.length === 0) {
            fetchUsers();
        }
    }, [sendMode]);

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const response = await api.get("/users", { params: { limit: 99999 } });
            const users = response.data.users || [];
            // Sort alphabetically by username
            users.sort((a, b) => (a.username || "").localeCompare(b.username || ""));
            setAllUsers(users);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    // Filtered users based on search
    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return allUsers;
        const q = searchQuery.toLowerCase();
        return allUsers.filter(
            (user) =>
                (user.username || "").toLowerCase().includes(q) ||
                (user.email || "").toLowerCase().includes(q)
        );
    }, [allUsers, searchQuery]);

    const toggleUser = (userEmail) => {
        setSelectedEmails((prev) => {
            const next = new Set(prev);
            if (next.has(userEmail)) {
                next.delete(userEmail);
            } else {
                next.add(userEmail);
            }
            return next;
        });
    };

    const selectAll = () => {
        const allEmails = allUsers.map((u) => u.email).filter(Boolean);
        setSelectedEmails(new Set(allEmails));
    };

    const deselectAll = () => {
        setSelectedEmails(new Set());
    };

    const isAllSelected = allUsers.length > 0 && selectedEmails.size === allUsers.length;

    const handleSendClick = (e) => {
        e.preventDefault();

        if (!email.title.trim() || !email.body.trim()) {
            alert("Please fill in both title and body");
            return;
        }

        if (sendMode === "selected" && selectedEmails.size === 0) {
            alert("Please select at least one user");
            return;
        }

        setShowConfirm(true);
    };

    const handleConfirmSend = async () => {
        setShowConfirm(false);
        setSending(true);
        setResult(null);
        try {
            const payload = { ...email };
            if (sendMode === "selected") {
                payload.emails = Array.from(selectedEmails);
            }

            const response = await api.post("/send-email-campaign", payload);
            setResult({
                type: "success",
                message: `Campaign sent! ${response.data.successCount} delivered, ${response.data.failCount} failed.`,
            });
            setEmail({ title: "", body: "" });
        } catch (error) {
            console.error("Failed to send email campaign:", error);
            setResult({
                type: "error",
                message: error.response?.data?.error || "Failed to send email campaign.",
            });
        } finally {
            setSending(false);
        }
    };

    const recipientLabel = sendMode === "all"
        ? "all registered users"
        : `${selectedEmails.size} selected user${selectedEmails.size !== 1 ? "s" : ""}`;

    return (
        <div className="space-y-6">
            {/* Email Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        <Mail size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Compose Email Campaign</h3>
                        <p className="text-sm text-slate-400">Send emails to your FairFare users</p>
                    </div>
                </div>

                <form onSubmit={handleSendClick} className="space-y-6">
                    {/* Title Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Email Subject
                        </label>
                        <input
                            type="text"
                            value={email.title}
                            onChange={(e) => setEmail({ ...email, title: e.target.value })}
                            placeholder="Enter email subject..."
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            maxLength={150}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            {email.title.length}/150 characters
                        </p>
                    </div>

                    {/* Body Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Email Body
                        </label>
                        <textarea
                            value={email.body}
                            onChange={(e) => setEmail({ ...email, body: e.target.value })}
                            placeholder="Write your email message here..."
                            rows={8}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                            maxLength={2000}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            {email.body.length}/2000 characters
                        </p>
                    </div>

                    {/* Send Mode Toggle */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-3">
                            Recipients
                        </label>
                        <div className="flex gap-2 bg-slate-800/50 rounded-xl p-1.5 border border-slate-700">
                            <button
                                type="button"
                                onClick={() => setSendMode("all")}
                                className={`flex items-center gap-2 flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                    sendMode === "all"
                                        ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                                        : "text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                <Users size={16} />
                                All Users
                            </button>
                            <button
                                type="button"
                                onClick={() => setSendMode("selected")}
                                className={`flex items-center gap-2 flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                    sendMode === "selected"
                                        ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                                        : "text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                <UserCheck size={16} />
                                Selected Users
                            </button>
                        </div>
                    </div>

                    {/* User Selector (when "selected" mode) */}
                    <AnimatePresence>
                        {sendMode === "selected" && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-4 space-y-3">
                                    {/* Search + Select All row */}
                                    <div className="flex items-center gap-3">
                                        {/* Search Bar */}
                                        <div className="relative flex-1">
                                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search users..."
                                                className="w-full pl-9 pr-9 py-2.5 bg-slate-800/50 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            />
                                            {searchQuery && (
                                                <button
                                                    type="button"
                                                    onClick={() => setSearchQuery("")}
                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full bg-slate-600 hover:bg-slate-500 text-slate-300 transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Select All / Deselect All button */}
                                        <button
                                            type="button"
                                            onClick={isAllSelected ? deselectAll : selectAll}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white transition-all whitespace-nowrap border border-slate-600"
                                        >
                                            {isAllSelected ? <CheckSquare size={16} className="text-purple-400" /> : <Square size={16} />}
                                            {isAllSelected ? "Deselect All" : "Select All"}
                                        </button>
                                    </div>

                                    {/* Selected count */}
                                    <div className="text-xs text-slate-400">
                                        {selectedEmails.size} of {allUsers.length} users selected
                                    </div>

                                    {/* User list */}
                                    {loadingUsers ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 size={24} className="animate-spin text-purple-400" />
                                            <span className="ml-2 text-slate-400 text-sm">Loading users...</span>
                                        </div>
                                    ) : filteredUsers.length === 0 ? (
                                        <div className="text-center py-6 text-slate-400 text-sm">
                                            {searchQuery ? "No users match your search" : "No users found"}
                                        </div>
                                    ) : (
                                        <div className="max-h-72 overflow-y-auto space-y-1 custom-scrollbar">
                                            {filteredUsers.map((user) => {
                                                const isSelected = selectedEmails.has(user.email);
                                                return (
                                                    <button
                                                        type="button"
                                                        key={user._id || user.email}
                                                        onClick={() => toggleUser(user.email)}
                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 ${
                                                            isSelected
                                                                ? "bg-purple-500/15 border border-purple-500/30"
                                                                : "bg-slate-800/30 border border-transparent hover:bg-slate-800/60"
                                                        }`}
                                                    >
                                                        {/* Checkbox */}
                                                        <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                                                            isSelected
                                                                ? "bg-purple-500 text-white"
                                                                : "bg-slate-700 border border-slate-600"
                                                        }`}>
                                                            {isSelected && (
                                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                                    <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                </svg>
                                                            )}
                                                        </div>

                                                        {/* Avatar */}
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                                                            isSelected
                                                                ? "bg-purple-500/20 text-purple-300"
                                                                : "bg-slate-700 text-slate-400"
                                                        }`}>
                                                            {(user.username || "U").charAt(0).toUpperCase()}
                                                        </div>

                                                        {/* Info */}
                                                        <div className="min-w-0 flex-1">
                                                            <p className={`text-sm font-medium truncate ${isSelected ? "text-white" : "text-slate-300"}`}>
                                                                {user.username || "Unknown"}
                                                            </p>
                                                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Info Alert */}
                    <div className="flex items-start gap-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                        <AlertCircle size={20} className="text-purple-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-purple-300">
                            <p className="font-medium mb-1">Email Preview</p>
                            <p className="text-purple-400/80">
                                The email will be wrapped in a beautiful template with FairFare branding. It will be sent to{" "}
                                <span className="font-bold">
                                    {sendMode === "all"
                                        ? "all registered users"
                                        : `${selectedEmails.size} selected user${selectedEmails.size !== 1 ? "s" : ""}`}
                                </span>.
                            </p>
                        </div>
                    </div>

                    {/* Result Banner */}
                    <AnimatePresence>
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`flex items-center gap-3 p-4 rounded-xl border ${
                                    result.type === "success"
                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                                        : "bg-red-500/10 border-red-500/20 text-red-300"
                                }`}
                            >
                                <CheckCircle size={20} />
                                <p className="text-sm font-medium">{result.message}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Send Button */}
                    <button
                        type="submit"
                        disabled={sending || !email.title.trim() || !email.body.trim() || (sendMode === "selected" && selectedEmails.size === 0)}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                    >
                        {sending ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send size={20} />
                                {sendMode === "all"
                                    ? "Send to All Users"
                                    : `Send to ${selectedEmails.size} User${selectedEmails.size !== 1 ? "s" : ""}`}
                            </>
                        )}
                    </button>
                </form>
            </motion.div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {showConfirm && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowConfirm(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className="fixed inset-0 flex items-center justify-center z-[101] p-4"
                        >
                            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl shadow-black/50">
                                <div className="flex justify-center mb-4">
                                    <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                        <Mail size={32} className="text-purple-400" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white text-center mb-2">
                                    Send Email Campaign?
                                </h3>
                                <div className="space-y-3 mb-6">
                                    <div className="bg-slate-800/50 rounded-xl p-3">
                                        <p className="text-xs text-slate-500 mb-1">Subject</p>
                                        <p className="text-sm text-white font-medium truncate">{email.title}</p>
                                    </div>
                                    <div className="bg-slate-800/50 rounded-xl p-3">
                                        <p className="text-xs text-slate-500 mb-1">Recipients</p>
                                        <p className="text-sm text-purple-300 font-medium">{recipientLabel}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowConfirm(false)}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors border border-white/5"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmSend}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-medium transition-colors border border-purple-500/20 flex items-center justify-center gap-2"
                                    >
                                        <Send size={16} />
                                        Send
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EmailCampaigns;
