import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import { Send, Users, Bell, BellOff, AlertCircle, CheckCircle, XCircle, UserCheck, Search, X, Loader2, CheckSquare, Square, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${bgColor} backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:shadow-2xl hover:shadow-${color}-500/10 transition-all duration-300`}
    >
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-600 dark:text-${color}-400`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                    {label}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {value}
                </p>
            </div>
        </div>
    </motion.div>
);

const NotificationCampaigns = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        usersWithFCM: 0,
        usersWithoutFCM: 0,
    });
    const [usersWithNotifications, setUsersWithNotifications] = useState([]);
    const [usersWithoutNotifications, setUsersWithoutNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [notification, setNotification] = useState({
        title: "",
        body: "",
    });

    // User selection state
    const [sendMode, setSendMode] = useState("all"); // "all" | "selected"
    const [allFcmUsers, setAllFcmUsers] = useState([]);
    const [selectedTokens, setSelectedTokens] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingFcmUsers, setLoadingFcmUsers] = useState(false);

    useEffect(() => {
        fetchNotificationStats();
        fetchUserLists();
    }, []);

    // Fetch FCM users for selection when switching to "selected" mode
    useEffect(() => {
        if (sendMode === "selected" && allFcmUsers.length === 0) {
            fetchFcmUsersForSelection();
        }
    }, [sendMode]);

    const fetchNotificationStats = async () => {
        try {
            const response = await api.get("/notification-stats");
            setStats(response.data);
        } catch (error) {
            console.error("Failed to fetch notification stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserLists = async () => {
        try {
            const response = await api.get("/notification-users");
            setUsersWithNotifications(response.data.usersWithFCM || []);
            setUsersWithoutNotifications(response.data.usersWithoutFCM || []);
        } catch (error) {
            console.error("Failed to fetch user lists:", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchFcmUsersForSelection = async () => {
        setLoadingFcmUsers(true);
        try {
            const response = await api.get("/notification-users");
            const users = (response.data.usersWithFCM || []).sort((a, b) =>
                (a.name || "").localeCompare(b.name || "")
            );
            setAllFcmUsers(users);
        } catch (error) {
            console.error("Failed to fetch FCM users:", error);
        } finally {
            setLoadingFcmUsers(false);
        }
    };

    // Filtered users based on search
    const filteredFcmUsers = useMemo(() => {
        if (!searchQuery.trim()) return allFcmUsers;
        const q = searchQuery.toLowerCase();
        return allFcmUsers.filter(
            (user) =>
                (user.name || "").toLowerCase().includes(q) ||
                (user.email || "").toLowerCase().includes(q)
        );
    }, [allFcmUsers, searchQuery]);

    const toggleUserToken = (email) => {
        setSelectedTokens((prev) => {
            const next = new Set(prev);
            if (next.has(email)) {
                next.delete(email);
            } else {
                next.add(email);
            }
            return next;
        });
    };

    const selectAllFcm = () => {
        const allEmails = allFcmUsers.map((u) => u.email).filter(Boolean);
        setSelectedTokens(new Set(allEmails));
    };

    const deselectAllFcm = () => {
        setSelectedTokens(new Set());
    };

    const isAllFcmSelected = allFcmUsers.length > 0 && selectedTokens.size === allFcmUsers.length;

    const handleSendClick = (e) => {
        e.preventDefault();

        if (!notification.title.trim() || !notification.body.trim()) {
            alert("Please fill in both title and body");
            return;
        }

        if (sendMode === "selected" && selectedTokens.size === 0) {
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
            const payload = { ...notification };

            if (sendMode === "selected") {
                const response = await api.get("/users", { params: { limit: 99999 } });
                const allDbUsers = response.data.users || [];
                const tokens = allDbUsers
                    .filter((u) => selectedTokens.has(u.email) && u.fcmToken)
                    .map((u) => u.fcmToken);
                payload.tokens = tokens;
            }

            const response = await api.post("/send-notification", payload);
            setResult({
                type: "success",
                message: `Notification sent! ${response.data.successCount} delivered, ${response.data.failCount} failed.`,
            });
            setNotification({ title: "", body: "" });
        } catch (error) {
            console.error("Failed to send notification:", error);
            setResult({
                type: "error",
                message: error.response?.data?.message || "Failed to send notification.",
            });
        } finally {
            setSending(false);
        }
    };

    const notifRecipientLabel = sendMode === "all"
        ? `${stats.usersWithFCM} users with notifications enabled`
        : `${selectedTokens.size} selected user${selectedTokens.size !== 1 ? "s" : ""}`;



    return (
        <div>
            {/* Stats Section */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        icon={Users}
                        label="Total Users"
                        value={stats.totalUsers}
                        color="blue"
                        bgColor="bg-slate-900/40"
                    />
                    <StatCard
                        icon={Bell}
                        label="Notifications Enabled"
                        value={stats.usersWithFCM}
                        color="emerald"
                        bgColor="bg-slate-900/40"
                    />
                    <StatCard
                        icon={BellOff}
                        label="Notifications Disabled"
                        value={stats.usersWithoutFCM}
                        color="rose"
                        bgColor="bg-slate-900/40"
                    />
                </div>
            )}

            {/* Notification Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <Send size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Send Notification</h3>
                </div>

                <form onSubmit={handleSendClick} className="space-y-6">
                    {/* Title Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Notification Title
                        </label>
                        <input
                            type="text"
                            value={notification.title}
                            onChange={(e) => setNotification({ ...notification, title: e.target.value })}
                            placeholder="Enter notification title..."
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            maxLength={100}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            {notification.title.length}/100 characters
                        </p>
                    </div>

                    {/* Body Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Notification Body
                        </label>
                        <textarea
                            value={notification.body}
                            onChange={(e) => setNotification({ ...notification, body: e.target.value })}
                            placeholder="Enter notification message..."
                            rows={5}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                            maxLength={300}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            {notification.body.length}/300 characters
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
                                        ? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
                                        : "text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                <Users size={16} />
                                All Users ({stats.usersWithFCM})
                            </button>
                            <button
                                type="button"
                                onClick={() => setSendMode("selected")}
                                className={`flex items-center gap-2 flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                    sendMode === "selected"
                                        ? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
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
                                        <div className="relative flex-1">
                                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search users..."
                                                className="w-full pl-9 pr-9 py-2.5 bg-slate-800/50 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                                        <button
                                            type="button"
                                            onClick={isAllFcmSelected ? deselectAllFcm : selectAllFcm}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white transition-all whitespace-nowrap border border-slate-600"
                                        >
                                            {isAllFcmSelected ? <CheckSquare size={16} className="text-blue-400" /> : <Square size={16} />}
                                            {isAllFcmSelected ? "Deselect All" : "Select All"}
                                        </button>
                                    </div>

                                    {/* Selected count */}
                                    <div className="text-xs text-slate-400">
                                        {selectedTokens.size} of {allFcmUsers.length} users selected
                                    </div>

                                    {/* User list */}
                                    {loadingFcmUsers ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 size={24} className="animate-spin text-blue-400" />
                                            <span className="ml-2 text-slate-400 text-sm">Loading users...</span>
                                        </div>
                                    ) : filteredFcmUsers.length === 0 ? (
                                        <div className="text-center py-6 text-slate-400 text-sm">
                                            {searchQuery ? "No users match your search" : "No users with notifications enabled"}
                                        </div>
                                    ) : (
                                        <div className="max-h-72 overflow-y-auto space-y-1 custom-scrollbar">
                                            {filteredFcmUsers.map((user, index) => {
                                                const isSelected = selectedTokens.has(user.email);
                                                return (
                                                    <button
                                                        type="button"
                                                        key={user.email || index}
                                                        onClick={() => toggleUserToken(user.email)}
                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 ${
                                                            isSelected
                                                                ? "bg-blue-500/15 border border-blue-500/30"
                                                                : "bg-slate-800/30 border border-transparent hover:bg-slate-800/60"
                                                        }`}
                                                    >
                                                        <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                                                            isSelected
                                                                ? "bg-blue-500 text-white"
                                                                : "bg-slate-700 border border-slate-600"
                                                        }`}>
                                                            {isSelected && (
                                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                                    <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                                                            isSelected
                                                                ? "bg-blue-500/20 text-blue-300"
                                                                : "bg-slate-700 text-slate-400"
                                                        }`}>
                                                            {(user.name || "U").charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className={`text-sm font-medium truncate ${isSelected ? "text-white" : "text-slate-300"}`}>
                                                                {user.name || "Unknown"}
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
                    <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <AlertCircle size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-300">
                            <p className="font-medium mb-1">Notification Preview</p>
                            <p className="text-blue-400/80">
                                This notification will be sent to{" "}
                                <span className="font-bold">
                                    {sendMode === "all"
                                        ? `${stats.usersWithFCM} users who have enabled notifications`
                                        : `${selectedTokens.size} selected user${selectedTokens.size !== 1 ? "s" : ""}`}
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
                        disabled={sending || !notification.title.trim() || !notification.body.trim() || (sendMode === "selected" && selectedTokens.size === 0)}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
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
                                    : `Send to ${selectedTokens.size} User${selectedTokens.size !== 1 ? "s" : ""}`}
                            </>
                        )}
                    </button>
                </form>
            </motion.div>

            {/* User Lists Section */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Users with Notifications Enabled */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <Bell size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Notifications Enabled</h3>
                            <p className="text-sm text-slate-400">{usersWithNotifications.length} users</p>
                        </div>
                    </div>

                    {loadingUsers ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 rounded-lg bg-slate-800 animate-pulse" />
                            ))}
                        </div>
                    ) : usersWithNotifications.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <BellOff size={48} className="mx-auto mb-2 opacity-50" />
                            <p>No users with notifications enabled</p>
                        </div>
                    ) : (
                        <div className="max-h-96 overflow-y-auto space-y-2 custom-scrollbar">
                            {usersWithNotifications.map((user, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold">
                                            {user.name?.charAt(0).toUpperCase() || user.phoneNumber?.charAt(0) || "U"}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{user.name || "Unknown"}</p>
                                            <p className="text-xs text-slate-400">{user.phoneNumber || user.email || "No contact"}</p>
                                        </div>
                                    </div>
                                    <CheckCircle size={18} className="text-emerald-400" />
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Users with Notifications Disabled */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                            <BellOff size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Notifications Disabled</h3>
                            <p className="text-sm text-slate-400">{usersWithoutNotifications.length} users</p>
                        </div>
                    </div>

                    {loadingUsers ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 rounded-lg bg-slate-800 animate-pulse" />
                            ))}
                        </div>
                    ) : usersWithoutNotifications.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <Bell size={48} className="mx-auto mb-2 opacity-50" />
                            <p>All users have notifications enabled!</p>
                        </div>
                    ) : (
                        <div className="max-h-96 overflow-y-auto space-y-2 custom-scrollbar">
                            {usersWithoutNotifications.map((user, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 font-semibold">
                                            {user.name?.charAt(0).toUpperCase() || user.phoneNumber?.charAt(0) || "U"}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{user.name || "Unknown"}</p>
                                            <p className="text-xs text-slate-400">{user.phoneNumber || user.email || "No contact"}</p>
                                        </div>
                                    </div>
                                    <XCircle size={18} className="text-rose-400" />
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

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
                                    <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                        <Bell size={32} className="text-blue-400" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white text-center mb-2">
                                    Send Push Notification?
                                </h3>
                                <div className="space-y-3 mb-6">
                                    <div className="bg-slate-800/50 rounded-xl p-3">
                                        <p className="text-xs text-slate-500 mb-1">Title</p>
                                        <p className="text-sm text-white font-medium truncate">{notification.title}</p>
                                    </div>
                                    <div className="bg-slate-800/50 rounded-xl p-3">
                                        <p className="text-xs text-slate-500 mb-1">Recipients</p>
                                        <p className="text-sm text-blue-300 font-medium">{notifRecipientLabel}</p>
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
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-medium transition-colors border border-blue-500/20 flex items-center justify-center gap-2"
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

export default NotificationCampaigns;
