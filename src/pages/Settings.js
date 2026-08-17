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
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
  },
  statBox: {
    background: "#0a1929",
    border: "1px solid #1e3a52",
    borderRadius: "8px",
    padding: "14px",
  },
  statLabel: {
    color: "#64748b",
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginBottom: "6px",
  },
  statValue: {
    fontSize: "1.5rem",
    fontWeight: 800,
  },
  inputRow: {
    display: "flex",
    gap: "10px",
    marginTop: "18px",
  },
  input: {
    background: "#17324d",
    color: "white",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #2b4764",
    fontSize: "14px",
    width: "100px",
  },
  updateBtn: {
    background: "#2dd4bf",
    color: "#0a1929",
    border: "none",
    borderRadius: "8px",
    padding: "8px 18px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "0.9rem",
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
  feedback: (ok) => ({
    color: ok ? "#22c55e" : "#ef4444",
    fontSize: "0.85rem",
    marginTop: "10px",
  }),
  footer: {
    textAlign: "center",
    color: "#64748b",
    marginTop: "40px",
    fontSize: "0.9rem",
  },
};

function Settings() {
  const [backendOk, setBackendOk] = useState(null);
  const [stats, setStats] = useState(null);
  const [visitorInput, setVisitorInput] = useState("");
  const [updateMsg, setUpdateMsg] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const checkBackend = async () => {
    try {
      await axios.get(`${API_URL}/`);
      setBackendOk(true);
    } catch (err) {
      setBackendOk(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      setStats(response.data);
    } catch (err) {
      setStats(null);
    }
  };

  const refreshAll = async () => {
    setLastChecked(new Date().toLocaleTimeString());
    await checkBackend();
    await fetchStats();
  };

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateVisitors = async () => {
    const count = parseInt(visitorInput, 10);
    if (isNaN(count) || count < 0) {
      setUpdateMsg({ ok: false, text: "Enter a valid non-negative number." });
      return;
    }
    try {
      await axios.put(`${API_URL}/stats/visitors`, null, {
        params: { count },
      });
      setUpdateMsg({ ok: true, text: `Visitor count updated to ${count}.` });
      setVisitorInput("");
      fetchStats();
    } catch (err) {
      setUpdateMsg({ ok: false, text: "Failed to update visitor count." });
    }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Settings & System Status</h1>
      <p style={styles.subheading}>
        Backend connectivity, live stats, and manual controls
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
          <div style={styles.cardTitle}>📊 Live Stats</div>
          {stats ? (
            <div style={styles.statGrid}>
              <div style={styles.statBox}>
                <div style={styles.statLabel}>Confused</div>
                <div style={styles.statValue}>{stats.confused_count}</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statLabel}>Suspicious</div>
                <div style={styles.statValue}>{stats.suspicious_count}</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statLabel}>Stockouts</div>
                <div style={styles.statValue}>{stats.stockout_count}</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statLabel}>Total Alerts</div>
                <div style={styles.statValue}>{stats.total_alerts}</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statLabel}>Visitors</div>
                <div style={styles.statValue}>{stats.visitor_count}</div>
              </div>
            </div>
          ) : (
            <div style={styles.detailText}>Stats unavailable.</div>
          )}
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>🧑‍🤝‍🧑 Update Visitor Count</div>
          <div style={styles.detailText}>
            Manually set the current visitor count (useful for testing/demo).
          </div>
          <div style={styles.inputRow}>
            <input
              type="number"
              min="0"
              placeholder="e.g. 12"
              value={visitorInput}
              onChange={(e) => setVisitorInput(e.target.value)}
              style={styles.input}
            />
            <button style={styles.updateBtn} onClick={handleUpdateVisitors}>
              Update
            </button>
          </div>
          {updateMsg && (
            <div style={styles.feedback(updateMsg.ok)}>{updateMsg.text}</div>
          )}
        </div>
      </div>

      <p style={styles.footer}>
        Smart Retail Intelligence (SRI) Dashboard | MSc Data Science Project | 2026
      </p>
    </div>
  );
}

export default Settings;