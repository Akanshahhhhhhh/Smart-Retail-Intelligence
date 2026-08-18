import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0a1929",
    color: "#e2e8f0",
    padding: "0 0 60px 0",
  },
  heading: {
    fontSize: "2.5rem",
    fontWeight: 800,
    margin: "40px 44px 4px 44px",
  },
  subheading: {
    color: "#94a3b8",
    margin: "0 44px 32px 44px",
  },
  cardsRow: {
    display: "flex",
    gap: "24px",
    margin: "0 44px 24px 44px",
    flexWrap: "wrap",
  },
  card: {
    background: "#0f2436",
    border: "1px solid #1e3a52",
    borderRadius: "12px",
    padding: "24px",
    flex: "1 1 320px",
    minWidth: "280px",
  },
  cardTitle: {
    color: "#2dd4bf",
    fontSize: "1.15rem",
    fontWeight: 700,
    marginBottom: "18px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
  },
  dot: (ok) => ({
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: ok ? "#22c55e" : "#ef4444",
    flexShrink: 0,
  }),
  statusText: {
    fontWeight: 700,
    fontSize: "1rem",
  },
  detailText: {
    color: "#94a3b8",
    fontSize: "0.9rem",
    marginTop: "4px",
  },
  refreshBtn: {
    background: "transparent",
    border: "1px solid #2dd4bf",
    color: "#2dd4bf",
    borderRadius: "8px",
    padding: "8px 18px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.9rem",
    margin: "0 44px 24px 44px",
  },
  aboutRow: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #1e3a52",
    padding: "8px 0",
    fontSize: "0.9rem",
  },
  aboutLabel: {
    color: "#64748b",
  },
  aboutValue: {
    fontWeight: 600,
  },
  footer: {
    textAlign: "center",
    color: "#64748b",
    marginTop: "40px",
    fontSize: "0.9rem",
  },
};

function Settings() {
  const [backendOk, setBackendOk] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const checkBackend = async () => {
    try {
      await axios.get(`${API_URL}/`);
      setBackendOk(true);
    } catch (err) {
      setBackendOk(false);
    }
  };

  const refreshAll = async () => {
    setLastChecked(new Date().toLocaleTimeString());
    await checkBackend();
  };

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Settings & System Status</h1>
      <p style={styles.subheading}>
        Backend connectivity and project info
      </p>

      <button style={styles.refreshBtn} onClick={refreshAll}>
        ↻ Refresh Status
      </button>

      <div style={styles.cardsRow}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>🔌 Backend Connection</div>
          <div style={styles.statusRow}>
            <span style={styles.dot(backendOk)} />
            <span style={styles.statusText}>
              {backendOk === null
                ? "Checking…"
                : backendOk
                ? "Connected"
                : "Disconnected"}
            </span>
          </div>
          <div style={styles.detailText}>API URL: {API_URL}</div>
          {lastChecked && (
            <div style={styles.detailText}>Last checked: {lastChecked}</div>
          )}
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>ℹ️ About This System</div>
          <div style={styles.aboutRow}>
            <span style={styles.aboutLabel}>Project</span>
            <span style={styles.aboutValue}>Smart Retail Intelligence</span>
          </div>
          <div style={styles.aboutRow}>
            <span style={styles.aboutLabel}>Type</span>
            <span style={styles.aboutValue}>MSc Data Science Project</span>
          </div>
          <div style={styles.aboutRow}>
            <span style={styles.aboutLabel}>Detection</span>
            <span style={styles.aboutValue}>YOLOv9 + DeepSORT</span>
          </div>
          <div style={styles.aboutRow}>
            <span style={styles.aboutLabel}>Backend</span>
            <span style={styles.aboutValue}>FastAPI + SQLite</span>
          </div>
          <div style={{ ...styles.aboutRow, borderBottom: "none" }}>
            <span style={styles.aboutLabel}>Frontend</span>
            <span style={styles.aboutValue}>React</span>
          </div>
        </div>
      </div>

      <p style={styles.footer}>
        Smart Retail Intelligence (SRI) Dashboard | MSc Data Science Project | 2026
      </p>
    </div>
  );
}

export default Settings;