import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon, Menu } from "lucide-react";
import { motion } from "framer-motion";

const Layout = ({ children }) => {
    const { theme, toggleTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
