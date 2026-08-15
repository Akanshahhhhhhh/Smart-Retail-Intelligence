import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000";

function Dashboard() {
  const [stats, setStats] = useState({
    confused_count: 0,
    suspicious_count: 0,
    stockout_count: 0,
    total_alerts: 0,
    visitor_count: 0,
  });

  const [alerts, setAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [acknowledgedIds, setAcknowledgedIds] = useState([]);
  const [popupAlert, setPopupAlert] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [flashAlert, setFlashAlert] = useState(false);
  const alarmRef = useRef(new Audio("/alarm.mp3"));
  alarmRef.current.loop = false;
  const lastAlertId = useRef(null);

  const fetchDashboardData = async () => {
    try {
      const statsResponse = await axios.get(`${API_URL}/stats`);
      setStats(statsResponse.data);

      const alertsResponse = await axios.get(`${API_URL}/alerts`);
      const newAlerts = alertsResponse.data.alerts;

      if (newAlerts.length > 0 && newAlerts[0].id !== lastAlertId.current) {
        const alert = newAlerts[0];
        lastAlertId.current = alert.id;
        setPopupAlert(alert);

        if (alert.severity === "HIGH" && alert.recipient === "Security") {
          alarmRef.current.currentTime = 0;
          alarmRef.current.play().catch((err) => console.log("Alarm not played:", err));
          setFlashAlert(true);
        }

        setTimeout(() => {
          setPopupAlert(null);
          setFlashAlert(false);
          alarmRef.current.pause();
          alarmRef.current.currentTime = 0;
        }, 5000);
      }

      setAlerts(newAlerts);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const acknowledgeAlert = (alertId) => {
    setAcknowledgedIds((prev) => [...prev, alertId]);
    if (popupAlert && popupAlert.id === alertId) {
      setPopupAlert(null);
    }
    alarmRef.current.pause();
    alarmRef.current.currentTime = 0;
    setFlashAlert(false);
  };

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

  const filteredAlerts = alerts
    .filter((alert) => !acknowledgedIds.includes(alert.id))
    .filter((alert) => {
      if (activeTab === "ALL") return true;
      if (activeTab === "STAFF") return alert.recipient === "Floor Staff";
      if (activeTab === "SECURITY") return alert.recipient === "Security";
      if (activeTab === "PROCUREMENT") return alert.recipient === "Procurement";
      return true;
    });

  return (
    <>
      {popupAlert && (
        <div className="popup">
          <h3>{popupAlert.severity === "HIGH" ? "🔴 HIGH ALERT" : "🟡 ALERT"}</h3>
          <p><strong>{popupAlert.alert_type}</strong></p>
          <p>👤 Person {popupAlert.person_id}</p>
          <p>📍 {popupAlert.zone}</p>
          <p>👮 {popupAlert.recipient}</p>
        </div>
      )}

      <div className="title-section">
        <div className="title-row">
          <div>
            <h1>Retail Operations Dashboard</h1>
            <p>AI-Powered Real-Time Retail Monitoring</p>
            <div className="live-clock">🕒 {currentTime.toLocaleString()}</div>
          </div>
          <div className="status-box">
            <h3>🟢 Backend Connected</h3>
            <p>FastAPI + YOLOv9 Online</p>
          </div>
        </div>
      </div>

      <div className="cards">
        <div className="card confused">
          <div className="card-top"></div>
          <h3>👥 Confused Customers</h3>
          <h1>{stats.confused_count}</h1>
          <p>Today's Cases</p>
        </div>

        <div className={`card suspicious ${flashAlert ? "flash-card" : ""}`}>
          <div className="card-top"></div>
          <h3>🚨 Suspicious Alerts</h3>
          <h1>{stats.suspicious_count}</h1>
          <p>Requires Attention</p>
        </div>

        <div className="card stockout">
          <div className="card-top"></div>
          <h3>📦 Shelf Stockouts</h3>
          <h1>{stats.stockout_count}</h1>
          <p>Detected Today</p>
        </div>

        <div className="card alerts">
          <div className="card-top"></div>
          <h3>⚠ Total Alerts</h3>
          <h1>{alerts.length}</h1>
          <p>Live Alerts</p>
        </div>

        <div className="card visitors">
          <div className="card-top"></div>
          <h3>🚶 Visitors</h3>
          <h1>{stats.visitor_count}</h1>
          <p>Inside Store</p>
        </div>
      </div>

      <div className="middle-section">
        <div className="table-container">
          <h2>🚨 Live Alert Feed</h2>
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
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan="8">No alerts available</td>
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
                    <td>
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        style={{
                          background: "#0D9488",
                          color: "white",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        ✓ Acknowledge
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="notification-panel">
          <h2>🔔 Recent Notifications</h2>
          {alerts.length === 0 ? (
            <div className="notification-card">
              <h3>✅ System Normal</h3>
              <p>No active notifications.</p>
              <small>Waiting for live events...</small>
            </div>
          ) : (
            filteredAlerts.slice(0, 3).map((alert) => (
              <div className="notification-card" key={alert.id}>
                <h3>{alert.severity === "HIGH" ? "🔴 HIGH ALERT" : "🟡 ALERT"}</h3>
                <p><strong>{alert.alert_type}</strong></p>
                <p>👤 Person {alert.person_id}</p>
                <p>📍 {alert.zone}</p>
                <p>👮 {alert.recipient}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="heatmap">
        <h2>🗺️ Zone Activity Heatmap</h2>
        <div className="heatmap-box">
          <p>Heatmap generated by Agent 1 (YOLOv9 + DeepSORT) will appear here.</p>
          <p>Current Status: Waiting for live data...</p>
        </div>
      </div>
    </>
  );
}

export default Dashboard;