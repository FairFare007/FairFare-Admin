import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Tickets from "./pages/Tickets";
import Users from "./pages/Users";
import NotificationCampaigns from "./pages/NotificationCampaigns";
import "./index.css"; // Ensure global styles are applied

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/users" element={<Users />} />
          <Route path="/campaigns/notifications" element={<NotificationCampaigns />} />
          {/* Add more routes/placeholders as needed */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;