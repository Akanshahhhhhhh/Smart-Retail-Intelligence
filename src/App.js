import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import "./App.css";
import History from "./pages/History";
import Analytics from "./pages/Analytics";
import IncidentDetail from "./pages/IncidentDetail";

function App() {
  return (
    <BrowserRouter>
      <div className="dashboard">
        <Navbar />

        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/incident/:id" element={<IncidentDetail />} />
        </Routes>

        <footer className="footer">
          Smart Retail Intelligence (SRI) Dashboard | MSc Data Science Project | 2026
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;