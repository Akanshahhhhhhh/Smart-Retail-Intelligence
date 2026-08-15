import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000";

function History() {
  const [alerts, setAlerts] = useState([]);
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`${API_URL}/alerts/history`);
        setAlerts(response.data.alerts);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getSeverityClass = (severity) => {
    switch (severity?.toUpperCase()) {
      case "HIGH":
        return "severity high";
      case "MEDIUM":
        return "severity medium";
      case "LOW":
        return "severity low";
      default:
        return "severity";
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (severityFilter === "ALL") return true;
    return alert.severity === severityFilter;
  });

  return (
    <>
      <div className="title-section">
        <h1>Alert History</h1>
        <p>All recorded alerts, stored permanently in the database</p>
      </div>

      <div className="table-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2>📋 All Alerts ({filteredAlerts.length})</h2>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={{
              background: "#17324d",
              color: "white",
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid #2b4764",
              fontSize: "14px",
            }}
          >
            <option value="ALL">All Severities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Person ID</th>
              <th>Alert Type</th>
              <th>Severity</th>
              <th>Recipient</th>
              <th>Zone</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7">Loading history...</td>
              </tr>
            ) : filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan="7">No alerts found</td>
              </tr>
            ) : (
              filteredAlerts.map((alert) => (
                <tr key={alert.id}>
                  <td>{alert.id}</td>
                  <td>{alert.person_id}</td>
                  <td>{alert.alert_type}</td>
                  <td>
                    <span className={getSeverityClass(alert.severity)}>
                      {alert.severity}
                    </span>
                  </td>
                  <td>{alert.recipient}</td>
                  <td>{alert.zone}</td>
                  <td>{alert.timestamp}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default History;