from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Smart Retail Intelligence API")

# Allow React frontend to access the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Later you can restrict this if needed
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
    "visitors": 0,
    "confused": 0,
    "suspicious": 0,
    "stockouts": 0
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
    next_alert_id += 1

    alerts.insert(0, alert_data)

    # Update statistics
    alert_type = alert.alert_type.lower()

    if "confused" in alert_type:
        stats["confused"] += 1

    elif "suspicious" in alert_type:
        stats["suspicious"] += 1

    elif "stockout" in alert_type:
        stats["stockouts"] += 1

    return {
        "message": "Alert added successfully",
        "alert": alert_data
    }

@app.get("/stats")
def get_stats():
    return stats


@app.put("/stats/visitors")
def update_visitors(count: int):
    stats["visitors"] = count
    return {
        "message": "Visitor count updated",
        "visitors": count
    }