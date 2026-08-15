import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="dashboard">
        <Navbar />

        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>

        <footer className="footer">
          Smart Retail Intelligence (SRI) Dashboard | MSc Data Science Project | 2026
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;