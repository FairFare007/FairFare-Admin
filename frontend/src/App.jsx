import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import SecurityProvider from "./components/SecurityProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Tickets from "./pages/Tickets";
import Users from "./pages/Users";
import Campaigns from "./pages/Campaigns";
import AuthScreen from "./pages/AuthScreen";
import AccessRequests from "./pages/AccessRequests";
import ActivityLogs from "./pages/ActivityLogs";
import ChangePassword from "./pages/ChangePassword";
import NoAccess from "./pages/NoAccess";
import PermissionsManagement from "./pages/PermissionsManagement";
import RequestPermissions from "./pages/RequestPermissions";
import MyRequests from "./pages/MyRequests";
import "./index.css"; // Ensure global styles are applied

function App() {
  return (
    <SecurityProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<AuthScreen />} />

              {/* Protected routes */}
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute requiredPermission="manage_users"><Users /></ProtectedRoute>} />
              <Route path="/campaigns" element={<ProtectedRoute requiredPermission="send_campaigns"><Campaigns /></ProtectedRoute>} />
              <Route path="/access-requests" element={<ProtectedRoute requiredPermission="manage_access_requests"><AccessRequests /></ProtectedRoute>} />
              <Route path="/activity-logs" element={<ProtectedRoute><ActivityLogs /></ProtectedRoute>} />
              <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
              <Route path="/permissions" element={<ProtectedRoute requiredPermission="manage_permissions"><PermissionsManagement /></ProtectedRoute>} />
              <Route path="/request-permissions" element={<ProtectedRoute><RequestPermissions /></ProtectedRoute>} />
              <Route path="/my-requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />
              <Route path="/no-access" element={<ProtectedRoute><NoAccess /></ProtectedRoute>} />

              {/* Catch-all */}
              <Route path="*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </SecurityProvider>
  );
}

export default App;