import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const MetricCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue", delay = 0 }) => {

    const colorStyles = {
        blue: "from-blue-500 to-cyan-500",
        emerald: "from-emerald-500 to-teal-500",
        violet: "from-violet-500 to-purple-500",
        amber: "from-amber-500 to-orange-500",
        rose: "from-rose-500 to-pink-500"
    };

    const bgStyles = {
        blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
        amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="glass-card bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${bgStyles[color]} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                        trend === 'down' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                        {trend === 'up' && <TrendingUp size={14} />}
                        {trend === 'down' && <TrendingDown size={14} />}
                        {trend === 'flat' && <Minus size={14} />}
                        {trendValue}
                    </div>
                )}
            </div>

            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                {title}
            </h3>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {value}
            </div>

            {/* Decorative gradient blob */}
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br ${colorStyles[color]} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500`} />
        </motion.div>
    );
};

export default MetricCard;
