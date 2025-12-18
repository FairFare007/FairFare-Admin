import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import AuthScreen from "./pages/AuthScreen";
import Overview from "./pages/Overview";
import PasswordReset from "./pages/PasswordReset";
import Campaigns from "./pages/Campaigns";
import { UsersPage, LogsPage } from "./pages/Placeholders";
import AdminProfile from "./pages/AdminProfile";
import ProtectedRoutes from "./components/ProtectedRoutes";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
  }

  // useEffect(() => {
  //   const token = localStorage.getItem("adminToken");
  //   if (token) setIsAuthenticated(true);
  // }, []);

  // const handleLogout = () => {
  //   localStorage.removeItem("adminToken");
  //   setIsAuthenticated(false);
  // };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <AuthScreen onLogin={() => setIsAuthenticated(true)} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoutes>
              <Layout onLogout={handleLogout} />
            </ProtectedRoutes>
          }
        >
          <Route index element={<Overview />} />
          <Route path="password-reset" element={<PasswordReset />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="admin-profile" element={<AdminProfile />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
