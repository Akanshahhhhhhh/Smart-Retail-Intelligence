import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";

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
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "40px 44px 0 44px",
    flexWrap: "wrap",
    gap: "16px",
  },
  heading: {
    fontSize: "2.2rem",
    fontWeight: 800,
    margin: 0,
  },
  subheading: {
    color: "#94a3b8",
    margin: "4px 0 0 0",
  },
  backLink: {
    color: "#2dd4bf",
    cursor: "pointer",
    fontWeight: 600,
    textDecoration: "none",
    fontSize: "0.95rem",
  },
  downloadBtn: {
    background: "#2dd4bf",
    color: "#0a1929",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  card: {
    background: "#0f2436",
    border: "1px solid #1e3a52",
    borderRadius: "12px",
    padding: "32px",
    margin: "32px 44px",
  },
  severityBadge: (sev) => ({
    display: "inline-block",
    background: SEVERITY_COLORS[sev] || "#64748b",
    color: "#fff",
    fontWeight: 700,
    fontSize: "0.85rem",
    padding: "4px 14px",
    borderRadius: "999px",
  }),
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "24px",
    marginTop: "28px",
  },
  field: {
    borderBottom: "1px solid #1e3a52",
    paddingBottom: "12px",
  },
  fieldLabel: {
    color: "#64748b",
    fontSize: "0.8rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "6px",
  },
  fieldValue: {
    fontSize: "1.1rem",
    fontWeight: 600,
  },
  statusMsg: {
    margin: "40px 44px",
    color: "#94a3b8",
  },
};

function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const response = await axios.get(`${API_URL}/alerts/${id}`);
        setAlert(response.data);
      } catch (err) {
        console.error("Error fetching alert:", err);
        setError(
          err.response && err.response.status === 404
            ? "No incident found with this ID."
            : err.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAlert();
  }, [id]);

  const handleDownloadReport = () => {
    if (!alert) return;

    const doc = new jsPDF();
    const marginX = 20;
    let y = 24;

    doc.setFontSize(18);
    doc.setFont(undefined, "bold");
    doc.text("Smart Retail Intelligence", marginX, y);
    y += 8;
    doc.setFontSize(13);
    doc.setFont(undefined, "normal");
    doc.text("Incident Report", marginX, y);
    y += 14;

    doc.setDrawColor(180, 180, 180);
    doc.line(marginX, y, 190, y);
    y += 12;

    const rows = [
      ["Incident ID", `#${alert.id}`],
      ["Person ID", `${alert.person_id}`],
      ["Alert Type", alert.alert_type || "N/A"],
      ["Severity", alert.severity || "N/A"],
      ["Zone", alert.zone || "N/A"],
      ["Recipient", alert.recipient || "N/A"],
      ["Timestamp", alert.timestamp || "N/A"],
      ["Message", alert.message || "N/A"],
    ];

    doc.setFontSize(11);
    rows.forEach(([label, value]) => {
      doc.setFont(undefined, "bold");
      doc.text(`${label}:`, marginX, y);
      doc.setFont(undefined, "normal");
      const wrapped = doc.splitTextToSize(String(value), 120);
      doc.text(wrapped, marginX + 45, y);
      y += 8 * (wrapped.length || 1) + 2;
    });

    y += 10;
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Report generated: ${new Date().toLocaleString()}`,
      marginX,
      y
    );
    y += 6;
    doc.text(
      "Smart Retail Intelligence (SRI) Dashboard | MSc Data Science Project | 2026",
      marginX,
      y
    );

    doc.save(`incident-report-${alert.id}.pdf`);
  };

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div>
          <span style={styles.backLink} onClick={() => navigate("/history")}>
            ← Back to History
          </span>
          <h1 style={styles.heading}>Incident Detail</h1>
          <p style={styles.subheading}>
            Full record for incident #{id}
          </p>
        </div>
        {alert && (
          <button style={styles.downloadBtn} onClick={handleDownloadReport}>
            ⬇ Download Report (PDF)
          </button>
        )}
      </div>

      {loading && <p style={styles.statusMsg}>Loading incident…</p>}
      {error && (
        <p style={{ ...styles.statusMsg, color: "#ef4444" }}>{error}</p>
      )}

      {!loading && !error && alert && (
        <div style={styles.card}>
          <span style={styles.severityBadge(alert.severity)}>
            {alert.severity}
          </span>

          <div style={styles.grid}>
            <div style={styles.field}>
              <div style={styles.fieldLabel}>Incident ID</div>
              <div style={styles.fieldValue}>#{alert.id}</div>
            </div>
            <div style={styles.field}>
              <div style={styles.fieldLabel}>Person ID</div>
              <div style={styles.fieldValue}>{alert.person_id}</div>
            </div>
            <div style={styles.field}>
              <div style={styles.fieldLabel}>Alert Type</div>
              <div style={styles.fieldValue}>{alert.alert_type}</div>
            </div>
            <div style={styles.field}>
              <div style={styles.fieldLabel}>Zone</div>
              <div style={styles.fieldValue}>{alert.zone}</div>
            </div>
            <div style={styles.field}>
              <div style={styles.fieldLabel}>Recipient</div>
              <div style={styles.fieldValue}>{alert.recipient}</div>
            </div>
            <div style={styles.field}>
              <div style={styles.fieldLabel}>Timestamp</div>
              <div style={styles.fieldValue}>{alert.timestamp}</div>
            </div>
          </div>

          <div style={{ marginTop: "28px" }}>
            <div style={styles.fieldLabel}>Message</div>
            <div style={{ ...styles.fieldValue, fontWeight: 400, marginTop: "6px" }}>
              {alert.message}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IncidentDetail;