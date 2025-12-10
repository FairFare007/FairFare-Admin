import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AuthScreen from './pages/AuthScreen';
import Overview from './pages/Overview';
import PasswordReset from './pages/PasswordReset';
import Campaigns from './pages/Campaigns';
import { UsersPage, LogsPage } from './pages/Placeholders';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        {/* Public Route: Login */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <AuthScreen onLogin={() => setIsAuthenticated(true)} /> : <Navigate to="/" replace />} 
        />

        {/* Protected Routes */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Layout onLogout={() => setIsAuthenticated(false)} /> : <Navigate to="/login" replace />} 
        >
          {/* Index matches the path="/" exactly */}
          <Route index element={<Overview />} />
          <Route path="password-reset" element={<PasswordReset />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="logs" element={<LogsPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;