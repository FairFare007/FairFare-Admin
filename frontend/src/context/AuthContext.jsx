import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // true while restoring session

    // Restore session on mount
    useEffect(() => {
        const restoreSession = async () => {
            const token = localStorage.getItem("adminToken");
            if (!token) {
                setIsLoading(false);
                return;
            }
            try {
                const res = await api.get("/auth/me");
                setAdmin(res.data.admin);
                setIsAuthenticated(true);
            } catch (error) {
                // Token invalid or expired — clear it
                localStorage.removeItem("adminToken");
                setAdmin(null);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };
        restoreSession();
    }, []);

    const login = (token, adminData) => {
        localStorage.setItem("adminToken", token);
        setAdmin(adminData);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem("adminToken");
        setAdmin(null);
        setIsAuthenticated(false);
    };

    const hasPermission = (permissionKey) => {
        if (!admin) return false;
        if (admin.role === "superadmin") return true;
        return admin.permissions?.includes(permissionKey);
    };

    return (
        <AuthContext.Provider value={{ admin, isAuthenticated, isLoading, login, logout, hasPermission }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
