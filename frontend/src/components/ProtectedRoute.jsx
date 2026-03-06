import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredPermission }) => {
    const { isAuthenticated, isLoading, admin, hasPermission } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-slate-400 text-sm tracking-wide">Loading...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Force password change for new admins (but don't redirect if already on the change-password page)
    if (admin?.mustChangePassword && location.pathname !== "/change-password") {
        return <Navigate to="/change-password" replace />;
    }

    // Check granular permissions
    if (requiredPermission && !hasPermission(requiredPermission)) {
        return <Navigate to="/no-access" replace />;
    }

    return children;
};

export default ProtectedRoute;
