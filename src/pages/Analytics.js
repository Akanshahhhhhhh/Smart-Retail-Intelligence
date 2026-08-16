import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const API_URL = "http://localhost:8000";

const SEVERITY_COLORS = {
  HIGH: "#ef4444",
  MEDIUM: "#f59e0b",
  LOW: "#22c55e",
};

const ZONE_BAR_COLOR = "#2dd4bf";

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
    margin: "0 44px",
    flexWrap: "wrap",
  },
  card: {
    background: "#0f2436",
    border: "1px solid #1e3a52",
    borderRadius: "12px",
    padding: "24px",
    flex: "1 1 420px",
    minWidth: "320px",
  },
  cardTitle: {
    color: "#2dd4bf",
    fontSize: "1.15rem",
    fontWeight: 700,
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
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

function Analytics() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Aggregate counts by severity
  const severityCounts = alerts.reduce((acc, alert) => {
    const sev = alert.severity || "UNKNOWN";
    acc[sev] = (acc[sev] || 0) + 1;
    return acc;
  }, {});
  const severityData = Object.entries(severityCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Aggregate counts by zone
  const zoneCounts = alerts.reduce((acc, alert) => {
    const zone = alert.zone || "Unknown";
    acc[zone] = (acc[zone] || 0) + 1;
    return acc;
  }, {});
  const zoneData = Object.entries(zoneCounts)
    .map(([zone, count]) => ({ zone, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Analytics</h1>
      <p style={styles.subheading}>
        Alert trends by severity and zone, based on recorded history
      </p>

      {loading && <p style={styles.statusMsg}>Loading analytics…</p>}
      {error && (
        <p style={{ ...styles.statusMsg, color: "#ef4444" }}>
          Error loading data: {error}
        </p>
      )}

      {!loading && !error && alerts.length === 0 && (
        <p style={styles.statusMsg}>
          No alerts recorded yet — charts will populate once alerts come in.
        </p>
      )}

      {!loading && !error && alerts.length > 0 && (
        <div style={styles.cardsRow}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>🚨 Alerts by Severity</div>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={severityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {severityData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={SEVERITY_COLORS[entry.name] || "#64748b"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#132743",
                    border: "1px solid #1e3a52",
                    borderRadius: "8px",
                    color: "#e2e8f0",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTitle}>📍 Alerts by Zone</div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={zoneData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a52" />
                <XAxis dataKey="zone" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "#132743",
                    border: "1px solid #1e3a52",
                    borderRadius: "8px",
                    color: "#e2e8f0",
                  }}
                />
                <Bar dataKey="count" fill={ZONE_BAR_COLOR} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <p style={styles.footer}>
        Smart Retail Intelligence (SRI) Dashboard | MSc Data Science Project | 2026
      </p>
    </div>
  );
}

export default Analytics;