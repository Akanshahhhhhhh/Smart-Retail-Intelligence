import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// NOTE: Simple hardcoded credential check for prototype purposes.
// A production version would verify against a hashed password stored
// in a backend user database, not a fixed value in the frontend.
const VALID_USERNAME = "admin";
const VALID_PASSWORD = "admin123";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0a1929",
    color: "#e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    background: "#0f2436",
    border: "1px solid #1e3a52",
    borderRadius: "12px",
    padding: "40px",
    width: "340px",
  },
  logo: {
    fontSize: "1.4rem",
    fontWeight: 800,
    color: "#2dd4bf",
    marginBottom: "4px",
    textAlign: "center",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "0.85rem",
    marginBottom: "28px",
    textAlign: "center",
  },
  label: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    marginBottom: "6px",
    display: "block",
  },
  input: {
    width: "100%",
    background: "#17324d",
    color: "white",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #2b4764",
    fontSize: "14px",
    marginBottom: "18px",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    background: "#2dd4bf",
    color: "#0a1929",
    border: "none",
    borderRadius: "8px",
    padding: "12px",
    fontWeight: 700,
    fontSize: "0.95rem",
    cursor: "pointer",
  },
  error: {
    color: "#ef4444",
    fontSize: "0.85rem",
    marginBottom: "14px",
    textAlign: "center",
  },
};

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      onLogin();
      navigate("/");
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>🛒 Smart Retail Intelligence</div>
        <div style={styles.subtitle}>Sign in to access the dashboard</div>

        <form onSubmit={handleSubmit}>
          {error && <div style={styles.error}>{error}</div>}

          <label style={styles.label}>Username</label>
          <input
            style={styles.input}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button style={styles.button} type="submit">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;