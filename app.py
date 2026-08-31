from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse  # NEW
from pydantic import BaseModel
from typing import List
from datetime import datetime
import os  # NEW

app = FastAPI(title="Smart Retail Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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

# NEW: path to the static heatmap PNG saved by detection.py
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
HEATMAP_PATH = os.path.join(STATIC_DIR, "heatmap.png")


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

    return {
        "message": "Alert added successfully",
        "alert": alert_data
    }


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


# NEW: serves the heatmap PNG saved by detection.py
@app.get("/heatmap")
def get_heatmap():
    if not os.path.exists(HEATMAP_PATH):
        return {"error": "Heatmap not generated yet. Run detection.py first."}
    return FileResponse(HEATMAP_PATH, media_type="image/png")
