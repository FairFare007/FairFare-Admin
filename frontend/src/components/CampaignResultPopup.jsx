import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Mail, Bell, X } from "lucide-react";

// Animated counter hook
const useCountUp = (target, duration = 1200, delay = 600) => {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (target === 0) { setValue(0); return; }
        const timeout = setTimeout(() => {
            const startTime = Date.now();
            const step = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                setValue(Math.round(eased * target));
                if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        }, delay);
        return () => clearTimeout(timeout);
    }, [target, duration, delay]);
    return value;
};

// Confetti particle
const Particle = ({ index, color }) => {
    const angle = (index / 12) * 360;
    const distance = 60 + Math.random() * 40;
    const size = 4 + Math.random() * 4;
    const rad = (angle * Math.PI) / 180;

    return (
        <motion.div
            initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            animate={{
                opacity: 0,
                x: Math.cos(rad) * distance,
                y: Math.sin(rad) * distance,
                scale: 0,
            }}
            transition={{ duration: 0.9, delay: 0.3 + index * 0.03, ease: "easeOut" }}
            style={{
                position: "absolute",
                width: size,
                height: size,
                borderRadius: index % 3 === 0 ? "50%" : "2px",
                background: color,
                top: "50%",
                left: "50%",
                marginTop: -size / 2,
                marginLeft: -size / 2,
            }}
        />
    );
};

// SVG Circular progress ring
const ProgressRing = ({ percentage, color, size = 140, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    return (
        <svg width={size} height={size} className="transform -rotate-90">
            {/* Background track */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={strokeWidth}
            />
            {/* Animated progress */}
            <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference * (1 - percentage / 100) }}
                transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
            />
        </svg>
    );
};

const particleColors = {
    email: ["#a855f7", "#c084fc", "#e879f9", "#f472b6", "#818cf8", "#6366f1"],
    notification: ["#3b82f6", "#06b6d4", "#22d3ee", "#38bdf8", "#818cf8", "#2dd4bf"],
};

const themes = {
    email: {
        accent: "purple",
        gradientFrom: "from-purple-600",
        gradientTo: "to-pink-500",
        ringColor: "#a855f7",
        failRingColor: "#f43f5e",
        icon: Mail,
        iconBg: "bg-purple-500/15",
        iconColor: "text-purple-400",
        successGlow: "shadow-purple-500/20",
        buttonBg: "bg-purple-500/15 hover:bg-purple-500/25 border-purple-500/20 text-purple-300",
    },
    notification: {
        accent: "blue",
        gradientFrom: "from-blue-600",
        gradientTo: "to-cyan-500",
        ringColor: "#3b82f6",
        failRingColor: "#f43f5e",
        icon: Bell,
        iconBg: "bg-blue-500/15",
        iconColor: "text-blue-400",
        successGlow: "shadow-blue-500/20",
        buttonBg: "bg-blue-500/15 hover:bg-blue-500/25 border-blue-500/20 text-blue-300",
    },
};

const CampaignResultPopup = ({
    show,
    onClose,
    successCount = 0,
    failCount = 0,
    totalRecipients = 0,
    type = "email", // "email" | "notification"
}) => {
    const theme = themes[type] || themes.email;
    const ThemeIcon = theme.icon;
    const percentage = totalRecipients > 0 ? Math.round((successCount / totalRecipients) * 100) : 0;
    const isFullSuccess = failCount === 0 && successCount > 0;
    const isFullFailure = successCount === 0 && failCount > 0;

    const animatedSuccess = useCountUp(show ? successCount : 0);
    const animatedFail = useCountUp(show ? failCount : 0);
    const animatedPercent = useCountUp(show ? percentage : 0, 1200, 400);

    const pColors = particleColors[type] || particleColors.email;

    return (
        <AnimatePresence>
            {show && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200]"
                    />

                    {/* Popup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.7, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 30 }}
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        className="fixed inset-0 flex items-center justify-center z-[201] p-4"
                    >
                        <div className={`bg-slate-900/95 border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl shadow-black/60 relative overflow-hidden`}>

                            {/* Decorative gradient blob */}
                            <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientTo} opacity-10 blur-3xl`} />
                            <div className={`absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientTo} opacity-5 blur-3xl`} />

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors z-10"
                            >
                                <X size={16} />
                            </button>

                            {/* Center Ring + Icon */}
                            <div className="flex justify-center mb-6 relative">
                                <div className="relative">
                                    <ProgressRing
                                        percentage={percentage}
                                        color={isFullFailure ? theme.failRingColor : theme.ringColor}
                                        size={140}
                                        strokeWidth={8}
                                    />
                                    {/* Center content inside ring */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                                        >
                                            {isFullFailure ? (
                                                <XCircle size={36} className="text-rose-400" />
                                            ) : (
                                                <CheckCircle size={36} className={theme.iconColor} />
                                            )}
                                        </motion.div>
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                            className="text-2xl font-bold text-white mt-1"
                                        >
                                            {animatedPercent}%
                                        </motion.p>
                                    </div>

                                    {/* Particles on success */}
                                    {!isFullFailure && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            {Array.from({ length: 16 }).map((_, i) => (
                                                <Particle
                                                    key={i}
                                                    index={i}
                                                    color={pColors[i % pColors.length]}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Title */}
                            <motion.h3
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-xl font-bold text-white text-center mb-1"
                            >
                                {isFullSuccess
                                    ? "Campaign Sent Successfully!"
                                    : isFullFailure
                                        ? "Campaign Failed"
                                        : "Campaign Completed"}
                            </motion.h3>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-sm text-slate-400 text-center mb-6"
                            >
                                {type === "email" ? "Email" : "Push Notification"} campaign results
                            </motion.p>

                            {/* Stats Cards */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.45 }}
                                className="grid grid-cols-2 gap-3 mb-6"
                            >
                                {/* Delivered */}
                                <div className="bg-emerald-500/8 border border-emerald-500/15 rounded-2xl p-4 text-center">
                                    <div className="flex items-center justify-center gap-1.5 mb-2">
                                        <CheckCircle size={16} className="text-emerald-400" />
                                        <span className="text-xs font-medium text-emerald-400/80 uppercase tracking-wider">Delivered</span>
                                    </div>
                                    <p className="text-3xl font-bold text-emerald-300 tabular-nums">
                                        {animatedSuccess}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        of {totalRecipients} total
                                    </p>
                                </div>

                                {/* Failed */}
                                <div className="bg-rose-500/8 border border-rose-500/15 rounded-2xl p-4 text-center">
                                    <div className="flex items-center justify-center gap-1.5 mb-2">
                                        <XCircle size={16} className="text-rose-400" />
                                        <span className="text-xs font-medium text-rose-400/80 uppercase tracking-wider">Failed</span>
                                    </div>
                                    <p className="text-3xl font-bold text-rose-300 tabular-nums">
                                        {animatedFail}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {failCount === 0 ? "no failures" : `${failCount} couldn't be sent`}
                                    </p>
                                </div>
                            </motion.div>

                            {/* Success bar */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.55 }}
                                className="mb-6"
                            >
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                                        className={`h-full rounded-full ${isFullFailure
                                                ? "bg-gradient-to-r from-rose-500 to-rose-400"
                                                : `bg-gradient-to-r ${theme.gradientFrom} ${theme.gradientTo}`
                                            }`}
                                    />
                                </div>
                                <div className="flex justify-between mt-1.5">
                                    <span className="text-xs text-slate-500">{percentage}% success rate</span>
                                    <span className="text-xs text-slate-500">{totalRecipients} recipients</span>
                                </div>
                            </motion.div>

                            {/* Close Button */}
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.65 }}
                                onClick={onClose}
                                className={`w-full px-6 py-3 rounded-xl font-medium transition-all border flex items-center justify-center gap-2 ${theme.buttonBg}`}
                            >
                                <ThemeIcon size={18} />
                                Done
                            </motion.button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CampaignResultPopup;
