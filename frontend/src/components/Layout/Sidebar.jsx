import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, BarChart2, Users, Settings, LogOut, ChevronLeft, ChevronRight, Menu, Ticket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = ({ isMobile, isOpen, setIsOpen }) => {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/" },
        { icon: BarChart2, label: "Analytics", path: "/analytics" },
        { icon: Ticket, label: "Tickets", path: "/tickets" },
        { icon: Users, label: "Users", path: "/users" }, // Placeholder for now
        { icon: Settings, label: "Settings", path: "/settings" }, // Placeholder
    ];

    const sidebarVariants = {
        expanded: { width: "240px" },
        collapsed: { width: "80px" },
    };

    const mobileVariants = {
        open: { x: 0 },
        closed: { x: "-100%" },
    };

    if (isMobile) {
        return (
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black z-40"
                        />
                        <motion.div
                            initial="closed"
                            animate="open"
                            exit="closed"
                            variants={mobileVariants}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 p-4"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                    FairFare
                                </h2>
                                <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
                                </button>
                            </div>
                            <nav className="space-y-2">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === item.path
                                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                            }`}
                                    >
                                        <item.icon size={20} />
                                        <span>{item.label}</span>
                                    </Link>
                                ))}
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        );
    }

    return (
        <motion.div
            variants={sidebarVariants}
            animate={isCollapsed ? "collapsed" : "expanded"}
            className="hidden md:flex flex-col h-screen fixed top-0 left-0 bottom-0 w-[240px] bg-slate-900/50 backdrop-blur-xl border-r border-white/5 z-30"
        >
            <div className="p-4 flex items-center justify-between">
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.h2
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-xl font-bold bg-gradient-to-r from-white to-indigo-400 bg-clip-text text-transparent truncate"
                        >
                            FairFare
                        </motion.h2>
                    )}
                </AnimatePresence>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors relative group ${location.pathname === item.path
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                    >
                        <item.icon size={22} className="min-w-[22px]" />
                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "auto" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="whitespace-nowrap overflow-hidden font-medium"
                                >
                                    {item.label}
                                </motion.span>
                            )}
                        </AnimatePresence>
                        {isCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                {item.label}
                            </div>
                        )}
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <button className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <LogOut size={22} />
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                className="whitespace-nowrap overflow-hidden font-medium"
                            >
                                Logout
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </motion.div>
    );
};

export default Sidebar;
