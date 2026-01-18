import React, { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import MetricCard from "../components/Dashboard/MetricCard";
import api from "../services/api";
import { Users, CreditCard, Layers, Activity, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalGroups: 0,
        totalExpenses: 0,
        totalVolume: 0,
        totalAiUsage: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get("/dashboard-stats");
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
                // Fallback or toast could go here
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const metrics = [
        {
            title: "Total Users",
            value: stats.totalUsers || 0,
            icon: Users,
            trend: "up",
            trendValue: "+12%", // Placeholder trend logic
            color: "blue",
        },
        {
            title: "Total Groups",
            value: stats.totalGroups || 0,
            icon: Layers,
            trend: "flat",
            trendValue: "0%",
            color: "violet",
        },
        {
            title: "Expense Volume",
            value: `₹${stats.totalVolume?.toLocaleString("en-IN") || 0}`,
            icon: DollarSign,
            trend: "up",
            trendValue: "+24%",
            color: "emerald",
        },
        {
            title: "AI Interactions",
            value: stats.totalAiUsage || 0,
            icon: Activity,
            trend: "up",
            trendValue: "+5%",
            color: "rose",
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
                    {[1, 2, 3, 4].map((i) => (
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
                    {metrics.map((metric, index) => (
                        <MetricCard key={index} {...metric} />
                    ))}
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
