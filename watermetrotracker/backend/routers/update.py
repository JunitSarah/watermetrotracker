from fastapi import APIRouter
from pydantic import BaseModel
from database.connect import db

router = APIRouter(tags=["update"])

class FerryUpdate(BaseModel):
    id: str
    latitude: float
    longitude: float
    speed: str = "N/A"

@router.post("/update-location", summary="Update Ferry Location", description="Updates the real-time location of a ferry.")
def update_ferry_location(data: FerryUpdate):
    result = db["ferry_locations"].update_one(
        {"id": data.id},
        {
            "$set": {
                "lat": data.latitude,
                "lng": data.longitude,
                "speed": data.speed
            }
        },
        upsert=True
    )
    if result.modified_count or result.upserted_id:
        return {"message": f"✅ Location updated for {data.id}"}
    return {"message": "⚠️ No matching ferry found or no change made"}

