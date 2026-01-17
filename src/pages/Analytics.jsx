import React, { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import api from "../services/api";
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend,
} from "recharts";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

const Analytics = () => {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [userGrowth, setUserGrowth] = useState([]);
    const [financials, setFinancials] = useState({ categoryDistribution: [], volumeTrend: [] });
    const [activity, setActivity] = useState({ topUsers: [], topGroups: [] });

    // Mock data for initial render stability if API is empty/slow
    const mockGrowth = [
        { _id: "2024-01-01", count: 12 }, { _id: "2024-01-02", count: 19 },
        { _id: "2024-01-03", count: 3 }, { _id: "2024-01-04", count: 5 }, // ...
    ];

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [growthRes, financeRes, activityRes] = await Promise.all([
                    api.get("/user-growth"),
                    api.get("/financial-stats"),
                    api.get("/activity-stats")
                ]);

                setUserGrowth(growthRes.data.userGrowth || []);
                setFinancials(financeRes.data);
                setActivity(financeRes.data); // Note: Fix this mapping based on real response
            } catch (error) {
                console.error("Analytics fetch error:", error);
            }
        };
        fetchAnalytics();
    }, []);

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

    // Chart Design Props
    const gridColor = isDark ? "#334155" : "#e2e8f0";
    const textColor = isDark ? "#94a3b8" : "#64748b";

    // Default tooltip style
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 shadow-xl rounded-lg">
                    <p className="text-slate-600 dark:text-slate-300 font-medium mb-1">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm font-bold" style={{ color: entry.color }}>
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <Layout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white tracking-tight">Detailed Analytics</h2>
                <p className="text-slate-400">Deep dive into platform usage and financial trends.</p>
            </div>

            {/* Stacked Layout - Full Width Charts */}
            <div className="space-y-8">
                {/* User Growth Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="glass-card p-6 rounded-2xl w-full"
                >
                    <h3 className="text-lg font-semibold mb-6 text-slate-800 dark:text-white">User Growth (Last 30 Days)</h3>
                    <div className="h-[300px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={userGrowth.length ? userGrowth : mockGrowth}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                <XAxis dataKey="_id" stroke={textColor} tick={{ fontSize: 12 }} tickMargin={10} />
                                <YAxis stroke={textColor} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="count" name="New Users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Categories Pie Chart - Fixed & Full Width */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                    className="glass-card p-6 rounded-2xl w-full flex flex-col items-center"
                >
                    <h3 className="text-lg font-semibold mb-6 text-slate-800 dark:text-white w-full text-left">Expense Categories</h3>
                    <div className="h-[400px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={financials.categoryDistribution?.length ? financials.categoryDistribution : [{ _id: "No Data", totalAmount: 1 }]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={100}
                                    outerRadius={140}
                                    paddingAngle={5}
                                    dataKey="totalAmount"
                                    nameKey="_id"
                                >
                                    {(financials.categoryDistribution?.length ? financials.categoryDistribution : [{ _id: "No Data", totalAmount: 1 }]).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={financials.categoryDistribution?.length ? COLORS[index % COLORS.length] : "#334155"} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-slate-600 dark:text-slate-400 text-sm ml-1">{value}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Volume Trend Bar Chart */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                    className="glass-card p-6 rounded-2xl w-full"
                >
                    <h3 className="text-lg font-semibold mb-6 text-slate-800 dark:text-white">Transaction Volume (Daily)</h3>
                    <div className="h-[300px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financials.volumeTrend || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                <XAxis dataKey="_id" stroke={textColor} tick={{ fontSize: 12 }} />
                                <YAxis stroke={textColor} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? '#334155' : '#f1f5f9' }} />
                                <Bar dataKey="dailyTotal" name="Volume (₹)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
};

export default Analytics;
