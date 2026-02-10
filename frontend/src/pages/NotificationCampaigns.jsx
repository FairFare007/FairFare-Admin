import { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import api from "../services/api";
import { Send, Users, Bell, BellOff, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";

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
    const [notification, setNotification] = useState({
        title: "",
        body: "",
    });

    useEffect(() => {
        fetchNotificationStats();
        fetchUserLists();
    }, []);

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

    const handleSendNotification = async (e) => {
        e.preventDefault();
        
        if (!notification.title.trim() || !notification.body.trim()) {
            alert("Please fill in both title and body");
            return;
        }

        setSending(true);
        try {
            // Backend logic will be implemented later
            await api.post("/send-notification", notification);
            alert("Notification sent successfully!");
            setNotification({ title: "", body: "" });
        } catch (error) {
            console.error("Failed to send notification:", error);
            alert("Failed to send notification. Please try again.");
        } finally {
            setSending(false);
        }
    };

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

    return (
        <Layout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                    Notification Campaigns
                </h2>
                <p className="text-slate-400">
                    Send push notifications to your users
                </p>
            </div>

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

                <form onSubmit={handleSendNotification} className="space-y-6">
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

                    {/* Info Alert */}
                    <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <AlertCircle size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-300">
                            <p className="font-medium mb-1">Notification Preview</p>
                            <p className="text-blue-400/80">
                                This notification will be sent to <span className="font-bold">{stats.usersWithFCM}</span> users who have enabled notifications.
                            </p>
                        </div>
                    </div>

                    {/* Send Button */}
                    <button
                        type="submit"
                        disabled={sending || !notification.title.trim() || !notification.body.trim()}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                    >
                        <Send size={20} />
                        {sending ? "Sending..." : "Send Notification"}
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
        </Layout>
    );
};

export default NotificationCampaigns;
