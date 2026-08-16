from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime
import sqlite3

app = FastAPI(title="Smart Retail Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def init_db():
    conn = sqlite3.connect("sri.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            person_id INTEGER,
            alert_type TEXT,
            severity TEXT,
            message TEXT,
            recipient TEXT,
            zone TEXT,
            timestamp TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()

class Alert(BaseModel):
    person_id: int
    alert_type: str
    severity: str
    message: str
    recipient: str
    zone: str = "General"

alerts: List[dict] = []
next_alert_id = 1

stats = {
    "confused_count": 0,
    "suspicious_count": 0,
    "stockout_count": 0,
    "total_alerts": 0,
    "visitor_count": 0
}

@app.get("/")
def home():
    return {"message": "Smart Retail Intelligence API is running!"}

@app.get("/alerts")
def get_alerts():
    return {"alerts": alerts}

@app.post("/alerts")
def add_alert(alert: Alert):
    global next_alert_id

    alert_data = alert.dict()
    alert_data["id"] = next_alert_id
    alert_data["timestamp"] = datetime.now().strftime("%d %b %Y %I:%M:%S %p")
    next_alert_id += 1

    alerts.insert(0, alert_data)

    alert_type = alert.alert_type.lower()

    if "confused" in alert_type:
        stats["confused_count"] += 1
    elif "suspicious" in alert_type:
        stats["suspicious_count"] += 1
    elif "stockout" in alert_type:
        stats["stockout_count"] += 1
    stats["total_alerts"] += 1

    conn = sqlite3.connect("sri.db")
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO alerts (person_id, alert_type, severity, message, recipient, zone, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        alert_data["person_id"],
        alert_data["alert_type"],
        alert_data["severity"],
        alert_data["message"],
        alert_data["recipient"],
        alert_data["zone"],
        alert_data["timestamp"]
    ))
    conn.commit()
    conn.close()

    return {
        "message": "Alert added successfully",
        "alert": alert_data
    }

@app.get("/alerts/history")
def get_alert_history():
    conn = sqlite3.connect("sri.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM alerts ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return {"alerts": [dict(row) for row in rows]}

@app.get("/alerts/{alert_id}")
def get_alert_by_id(alert_id: int):
    conn = sqlite3.connect("sri.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,))
    row = cursor.fetchone()
    conn.close()
    if row is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return dict(row)

@app.get("/stats")
def get_stats():
    return stats

@app.put("/stats/visitors")
def update_visitors(count: int):
    stats["visitor_count"] = count
    return {
        "message": "Visitor count updated",
        "visitor_count": count
    }