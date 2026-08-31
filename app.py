from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime


app = FastAPI(title="Smart Retail Intelligence API")


# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Alert data model
class Alert(BaseModel):
    person_id: int
    alert_type: str
    severity: str
    message: str
    recipient: str
    zone: str = "General"


# Store alerts in memory
alerts: List[dict] = []

next_alert_id = 1


# Dashboard statistics
stats = {
    "confused_count": 0,
    "suspicious_count": 0,
    "stockout_count": 0,
    "total_alerts": 0,
    "visitor_count": 0
}


# Home route
@app.get("/")
def home():
    return {
        "message": "Smart Retail Intelligence API is running!"
    }


# Get all alerts
@app.get("/alerts")
def get_alerts():
    return {
        "alerts": alerts
    }


# Add a new alert
@app.post("/alerts")
def add_alert(alert: Alert):

    global next_alert_id

    alert_data = alert.dict()

    # Add ID
    alert_data["id"] = next_alert_id

    # Add timestamp
    alert_data["timestamp"] = datetime.now().strftime(
        "%d %b %Y %I:%M:%S %p"
    )

    next_alert_id += 1

    # Add newest alert at the beginning
    alerts.insert(0, alert_data)

    # Update statistics
    alert_type = alert.alert_type.lower()

    if "confused" in alert_type:
        stats["confused_count"] += 1

    elif "suspicious" in alert_type:
        stats["suspicious_count"] += 1

    elif "stockout" in alert_type:
        stats["stockout_count"] += 1

    stats["total_alerts"] += 1

    return {
        "message": "Alert added successfully",
        "alert": alert_data
    }


# Get dashboard statistics
@app.get("/stats")
def get_stats():
    return stats

# Get zone-wise activity for heatmap
@app.get("/heatmap/zones")
def get_heatmap_zones():
    zone_counts = {}
    for alert in alerts:
        zone = alert.get("zone", "General")
        zone_counts[zone] = zone_counts.get(zone, 0) + 1

    zones_list = [
        {"zone": zone, "count": count}
        for zone, count in zone_counts.items()
    ]
    zones_list.sort(key=lambda z: z["count"], reverse=True)

    return {"zones": zones_list}


# Update visitor count
@app.put("/stats/visitors")
def update_visitors(count: int):

    stats["visitor_count"] = count

    return {
        "message": "Visitor count updated",
        "visitor_count": count
    }
