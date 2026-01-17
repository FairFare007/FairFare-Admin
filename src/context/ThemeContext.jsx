import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Hardcoded to 'dark' as per user request
    const [theme] = useState("dark");

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light");
        root.classList.add("dark");
    }, []);

    // Toggle function is now a no-op but kept for API compatibility if needed briefly
    const toggleTheme = () => {
        console.log("Dark mode is enforced.");
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
