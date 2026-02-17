import React, { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import api from "../services/api";
import { Users, CreditCard, Layers, Activity, DollarSign, TrendingUp, TrendingDown, Minus, UserPlus, UserX, Percent } from "lucide-react";
import { motion } from "framer-motion";

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalGroups: 0,
        totalExpenses: 0,
        totalVolume: 0,
        totalAiUsage: 0,
        dailyActiveUsers: 0,
        weeklyActiveUsers: 0,
        monthlyActiveUsers: 0,
        recentSignups: 0,
        botUsers: 0,
        retentionRate: 0,
    });
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState("1d");

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch both dashboard stats and active users stats in parallel
                const [dashboardData, activeUsersData] = await Promise.all([
                    api.get("/dashboard-stats"),
                    api.get("/active-users-stats")
                ]);
                
                setStats({
                    ...dashboardData.data,
                    ...activeUsersData.data
                });
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
                // Fallback or toast could go here
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Helper: compute trend direction and percentage from current vs previous values
    const calcTrend = (current, previous) => {
        const curr = current || 0;
        const prev = previous || 0;
        if (prev === 0 && curr === 0) return { trend: "flat", trendValue: "0%" };
        if (prev === 0) return { trend: "up", trendValue: "+100%" };
        const pct = Math.round(((curr - prev) / prev) * 100);
        const clamped = Math.max(-999, Math.min(999, pct));
        if (clamped > 0) return { trend: "up", trendValue: `+${clamped}%` };
        if (clamped < 0) return { trend: "down", trendValue: `${clamped}%` };
        return { trend: "flat", trendValue: "0%" };
    };

    const metrics = [
        {
            title: "Total Users",
            value: stats.totalUsers || 0,
            icon: Users,
            ...calcTrend(stats.totalUsers, stats.prevUsers),
            color: "blue",
        },
        {
            title: "Total Groups",
            value: stats.totalGroups || 0,
            icon: Layers,
            ...calcTrend(stats.totalGroups, stats.prevGroups),
            color: "violet",
        },
        {
            title: "Expense Volume",
            value: `₹${stats.totalVolume?.toLocaleString("en-IN") || 0}`,
            icon: DollarSign,
            ...calcTrend(stats.totalVolume, stats.prevVolume),
            color: "emerald",
        },
        {
            title: "AI Interactions",
            value: stats.totalAiUsage || 0,
            icon: Activity,
            ...calcTrend(stats.totalAiUsage, stats.prevAiUsage),
            color: "rose",
        },
        {
            title: "Recent Signups (30d)",
            value: stats.recentSignups || 0,
            icon: UserPlus,
            ...calcTrend(stats.recentSignups, stats.prevSignups),
            color: "blue",
        },
        {
            title: "Bot Users",
            value: stats.botUsers || 0,
            icon: UserX,
            trend: "flat",
            trendValue: `${stats.botUsers || 0}`,
            color: "rose",
        },
        {
            title: "Retention Rate",
            value: `${stats.retentionRate || 0}%`,
            icon: Percent,
            trend: stats.retentionRate >= 50 ? "up" : "down",
            trendValue: stats.retentionRate >= 50 ? "Healthy" : "Needs Work",
            color: "cyan",
        },
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <Layout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                    Dashboard Overview
                </h2>
                <p className="text-slate-400">
                    Welcome back, Admin. Here's what's happening today.
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                    ))}
                </div>
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {metrics.map((metric, index) => {
                        const colorStyles = {
                            blue: "from-blue-500 to-cyan-500",
                            emerald: "from-emerald-500 to-teal-500",
                            violet: "from-violet-500 to-purple-500",
                            amber: "from-amber-500 to-orange-500",
                            rose: "from-rose-500 to-pink-500",
                            cyan: "from-cyan-500 to-sky-500"
                        };

                        const bgStyles = {
                            blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                            emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                            violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
                            amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                            rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                            cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                        };

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className="glass-card bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${bgStyles[metric.color]} group-hover:scale-110 transition-transform duration-300`}>
                                        <metric.icon size={24} />
                                    </div>
                                    {metric.trend && (
                                        <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${
                                            metric.trend === 'up' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                            metric.trend === 'down' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :
                                            'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                        }`}>
                                            {metric.trend === 'up' && <TrendingUp size={14} />}
                                            {metric.trend === 'down' && <TrendingDown size={14} />}
                                            {metric.trend === 'flat' && <Minus size={14} />}
                                            {metric.trendValue}
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                                    {metric.title}
                                </h3>
                                <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                                    {metric.value}
                                </div>

                                {/* Decorative gradient blob */}
                                <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br ${colorStyles[metric.color]} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500`} />
                            </motion.div>
                        );
                    })}
                    {/* Active Users Card with period selector */}
                    {(() => {
                        const periods = {
                            "1d": { label: "1d", value: stats.dailyActiveUsers || 0, fullLabel: "Daily" },
                            "7d": { label: "7d", value: stats.weeklyActiveUsers || 0, fullLabel: "Weekly" },
                            "30d": { label: "30d", value: stats.monthlyActiveUsers || 0, fullLabel: "Monthly" },
                        };
                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.4 }}
                                className="glass-card bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                                        <Users size={24} />
                                    </div>
                                    <div className="flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                                        <TrendingUp size={14} />
                                        Active
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Users</h3>
                                    <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
                                        {Object.keys(periods).map((period) => (
                                            <button
                                                key={period}
                                                onClick={() => setSelectedPeriod(period)}
                                                className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
                                                    selectedPeriod === period
                                                        ? "bg-indigo-600 text-white shadow-sm"
                                                        : "text-slate-400 hover:text-slate-300"
                                                }`}
                                            >
                                                {periods[period].label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                                    {periods[selectedPeriod].value}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    {periods[selectedPeriod].fullLabel} active users
                                </p>
                                <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500" />
                            </motion.div>
                        );
                    })()}
                </motion.div>
            )}

            {/* Quick visual filler for now to make it look populated */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-2xl h-64 flex items-center justify-center text-slate-400 border-dashed border-2 border-slate-300 dark:border-slate-700">
                    <span className="text-sm">Activity Feed (Coming Soon)</span>
                </div>
                <div className="glass-card p-6 rounded-2xl h-64 flex items-center justify-center text-slate-400 border-dashed border-2 border-slate-300 dark:border-slate-700">
                    <span className="text-sm">Recent Alerts (Coming Soon)</span>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
