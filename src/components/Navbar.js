import React from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar({ onLogout }) {
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
        <Link
        to="/video-evidence"
        style={{
            color: isActive("/video-evidence") ? "#0D9488" : "white",
            borderBottom: isActive("/video-evidence") ? "2px solid #0D9488" : "none",
            textDecoration: "none",
         }}
>
         Video Evidence
        </Link>
        <Link
        to="/settings"
        style={{
         color: isActive("/settings") ? "#0D9488" : "white",
        borderBottom: isActive("/settings") ? "2px solid #0D9488" : "none",
         textDecoration: "none",
         }}
>
         Settings
</Link>
        <button
        onClick={onLogout}
        style={{
            background: "transparent",
            border: "1px solid #ef4444",
            color: "#ef4444",
            borderRadius: "6px",
            padding: "6px 14px",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "pointer",
            marginLeft: "8px",
            }}
>
         Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;