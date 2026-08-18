import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Analytics from "./pages/Analytics";
import IncidentDetail from "./pages/IncidentDetail";
import VideoEvidence from "./pages/VideoEvidence";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("sri_logged_in") === "true"
  );

  const handleLogin = () => {
    localStorage.setItem("sri_logged_in", "true");
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("sri_logged_in");
    setIsLoggedIn(false);
  };

  return (
    <BrowserRouter>
      {!isLoggedIn ? (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <div className="dashboard">
          <Navbar onLogout={handleLogout} />

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/incident/:id" element={<IncidentDetail />} />
            <Route path="/video-evidence" element={<VideoEvidence />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <footer className="footer">
            Smart Retail Intelligence (SRI) Dashboard | MSc Data Science Project | 2026
          </footer>
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;