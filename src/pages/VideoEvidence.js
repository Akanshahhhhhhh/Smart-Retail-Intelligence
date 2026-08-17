import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:8000";

const SEVERITY_COLORS = {
  HIGH: "#ef4444",
  MEDIUM: "#f59e0b",
  LOW: "#22c55e",
};

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
    margin: "0 44px 8px 44px",
  },
  noticeBox: {
    background: "#1c2e42",
    border: "1px solid #2b4764",
    borderRadius: "8px",
    padding: "12px 18px",
    margin: "16px 44px 32px 44px",
    color: "#94a3b8",
    fontSize: "0.9rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "24px",
    margin: "0 44px",
  },
  card: {
    background: "#0f2436",
    border: "1px solid #1e3a52",
    borderRadius: "12px",
    overflow: "hidden",
  },
  thumb: {
    height: "160px",
    background:
      "repeating-linear-gradient(45deg, #17324d, #17324d 10px, #132743 10px, #132743 20px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    fontSize: "0.85rem",
    fontWeight: 600,
    letterSpacing: "0.03em",
  },
  cardBody: {
    padding: "16px 18px",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  zone: {
    fontWeight: 700,
    fontSize: "1.05rem",
  },
  badge: (sev) => ({
    background: SEVERITY_COLORS[sev] || "#64748b",
    color: "#fff",
    fontWeight: 700,
    fontSize: "0.75rem",
    padding: "3px 10px",
    borderRadius: "999px",
  }),
  meta: {
    color: "#94a3b8",
    fontSize: "0.85rem",
    marginBottom: "14px",
  },
  viewBtn: {
    background: "transparent",
    border: "1px solid #2dd4bf",
    color: "#2dd4bf",
    borderRadius: "8px",
    padding: "8px 14px",
    fontWeight: 600,
    fontSize: "0.85rem",
    cursor: "pointer",
    width: "100%",
  },
  statusMsg: {
    margin: "40px 44px",
    color: "#94a3b8",
  },
  footer: {
    textAlign: "center",
    color: "#64748b",
    marginTop: "60px",
    fontSize: "0.9rem",
  },
};

function VideoEvidence() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`${API_URL}/alerts/history`);
        setAlerts(response.data.alerts || []);
      } catch (err) {
        console.error("Error fetching history:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Video Evidence</h1>
      <p style={styles.subheading}>
        Visual evidence linked to each recorded incident
      </p>
      <div style={styles.noticeBox}>
        Note: this is a placeholder gallery for demo purposes. Live video/snapshot
        capture is a planned extension and is not yet wired into the detection
        pipeline.
      </div>

      {loading && <p style={styles.statusMsg}>Loading incidents…</p>}
      {error && (
        <p style={{ ...styles.statusMsg, color: "#ef4444" }}>
          Error loading data: {error}
        </p>
      )}
      {!loading && !error && alerts.length === 0 && (
        <p style={styles.statusMsg}>
          No incidents recorded yet — evidence cards will appear here once
          alerts come in.
        </p>
      )}

      {!loading && !error && alerts.length > 0 && (
        <div style={styles.grid}>
          {alerts.map((alert) => (
            <div style={styles.card} key={alert.id}>
              <div style={styles.thumb}>NO SNAPSHOT AVAILABLE</div>
              <div style={styles.cardBody}>
                <div style={styles.cardTop}>
                  <span style={styles.zone}>{alert.zone}</span>
                  <span style={styles.badge(alert.severity)}>
                    {alert.severity}
                  </span>
                </div>
                <div style={styles.meta}>
                  #{alert.id} · {alert.alert_type} · {alert.timestamp}
                </div>
                <button
                  style={styles.viewBtn}
                  onClick={() => navigate(`/incident/${alert.id}`)}
                >
                  View Incident
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={styles.footer}>
        Smart Retail Intelligence (SRI) Dashboard | MSc Data Science Project | 2026
      </p>
    </div>
  );
}

export default VideoEvidence;