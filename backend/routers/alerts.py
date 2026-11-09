from fastapi import APIRouter
from pydantic import BaseModel, Field
from datetime import datetime
from database.connect import db

router = APIRouter(tags=["alerts"])

# 🚨 Alert model
class Alert(BaseModel):
    message: str
    type: str = "info" 
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

@router.post("/alerts")
def post_alert(alert: Alert):
    db["alerts"].insert_one(alert.model_dump())
    return {"message": "Alert posted successfully"}

@router.get("/alerts")
def get_alerts():
    alerts = list(db["alerts"].find({}, {"_id": 0}))
    return {"alerts": alerts}