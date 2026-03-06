import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { Menu, User, Power, Shield, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Layout = ({ children }) => {
    const { theme } = useTheme();
    const { admin, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);

    const getInitials = (name) => {
        if (!name) return "??";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    // Basic isMobile check (in real app prefer resize observer or useMedia hook)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
            {/* --- BACKGROUND FX LAYER --- */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
            </div>

            {/* Sidebar with higher z-index (Fixed handled in Sidebar component, adding margin here) */}
            <Sidebar isMobile={isMobile} isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />

            {/* Main Content with margin for fixed sidebar */}
            <div className={`flex-1 flex flex-col min-w-0 relative z-10 transition-all duration-300 ${!isMobile ? "md:ml-[240px]" : ""}`}>
                {/* Topbar */}
                <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-2 glass border-b border-slate-200/50 dark:border-slate-800/50 min-h-[64px]">
                    <div className="flex items-center gap-4">
                        {isMobile && (
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <Menu size={24} />
                            </button>
                        )}
                        <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent hidden sm:block">
                            Admin Portal
                        </h1>
                    </div>

                    {/* Profile Section */}
                    {admin && (
                        <div className="relative">
                            <button 
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
                            >
                                <div className="flex flex-col items-end hidden sm:flex">
                                    <span className="text-xs font-bold text-white leading-none mb-1">{admin.name}</span>
                                    <span className={`text-[10px] uppercase tracking-tighter font-semibold px-2 py-0.5 rounded-full ${
                                        admin.role === 'superadmin' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-blue-500/20 text-blue-400'
                                    }`}>
                                        {admin.role}
                                    </span>
                                </div>
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all text-sm font-black tracking-tighter ${
                                    admin.role === 'superadmin' ? 'bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white' : 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white'
                                }`}>
                                    {getInitials(admin.name)}
                                </div>
                            </button>

                            <AnimatePresence>
                                {showProfileDropdown && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-30" 
                                            onClick={() => setShowProfileDropdown(false)}
                                        />
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-3 w-64 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-40 overflow-hidden"
                                        >
                                            <div className="p-4 border-b border-white/5 bg-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                        admin.role === 'superadmin' ? 'bg-indigo-500 text-white' : 'bg-blue-600 text-white'
                                                    }`}>
                                                        <User size={20} />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-bold text-white truncate">{admin.name}</span>
                                                        <span className="text-[11px] text-slate-500 truncate">{admin.email}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-2">
                                                <button 
                                                    onClick={logout}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm font-bold"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                                                        <Power size={16} />
                                                    </div>
                                                    Sign Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                </header>

                <main className="flex-1 p-4 md:p-6 overflow-y-auto overflow-x-hidden relative">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
