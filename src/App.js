import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import "./App.css";
import History from "./pages/History";

function App() {
  return (
    <BrowserRouter>
      <div className="dashboard">
        <Navbar />

        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
        </Routes>

        <footer className="footer">
          Smart Retail Intelligence (SRI) Dashboard | MSc Data Science Project | 2026
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;