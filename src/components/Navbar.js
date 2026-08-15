import React from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="logo">🛒 Smart Retail Intelligence</div>

      <div className="nav-links">
        <Link
          to="/"
          style={{
            color: isActive("/") ? "#0D9488" : "white",
            borderBottom: isActive("/") ? "2px solid #0D9488" : "none",
            textDecoration: "none",
          }}
        >
          Dashboard
        </Link>

        <Link
          to="/history"
          style={{
            color: isActive("/history") ? "#0D9488" : "white",
            borderBottom: isActive("/history") ? "2px solid #0D9488" : "none",
            textDecoration: "none",
          }}
        >
          History
        </Link>

        <Link
          to="/analytics"
          style={{
            color: isActive("/analytics") ? "#0D9488" : "white",
            borderBottom: isActive("/analytics") ? "2px solid #0D9488" : "none",
            textDecoration: "none",
          }}
        >
          Analytics
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;