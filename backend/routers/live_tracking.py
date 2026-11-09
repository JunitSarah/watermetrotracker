from fastapi import APIRouter, Query
from database.connect import db

router = APIRouter(tags=["live-tracking"])

@router.get("/api/live-tracking", summary="Get live ferries from From → To")
def get_live_tracking(
    from_location: str = Query(..., description="From location"),
    to_location: str = Query(..., description="To location")
):
    matching_boats = []

    all_routes = db["ferry_schedules"].find({"from": from_location})

    for route in all_routes:
        
        if route.get("to", "").strip().title() == to_location.strip().title():
            matching_boats.append({
                "boat_id": route.get("boat_no", "N/A"),
                "departure_time": route.get("departure", "N/A"),
                "arrival_time": route.get("arrival", "N/A"),
                "route": route.get("route", "")
            })

        
        for stop in route.get("stops", []):
            stop_name = stop.get("station", "").strip().title()
            if stop_name == to_location.strip().title():
                matching_boats.append({
                    "boat_id": route.get("boat_no", "N/A"),
                    "departure_time": route.get("departure", "N/A"),
                    "arrival_time": stop.get("arrival", "N/A"),
                    "route": route.get("route", "")
                })

    return {"boats": matching_boats}
