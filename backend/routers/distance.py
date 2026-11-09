from fastapi import APIRouter, Query
from math import radians, cos, sin, asin, sqrt
from database.connect import db

router = APIRouter(tags=["distance"])

# Coordinates for each ferry stop
STOP_COORDINATES = {
    "High Court": (9.987, 76.278),
    "Vypin": (10.001, 76.235),
    "Fort Kochi": (9.966, 76.242),
    "Cheranalloor": (10.048, 76.289),
    "Eloor": (10.066, 76.295),
    "South Chittoor": (10.035, 76.282),
    "Kakkanad": (10.015, 76.363),
    "Vyttila": (9.967, 76.317)
}

def haversine(coord1, coord2):
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    r = 6371  
    return round(c * r, 2)


@router.get("/distance", summary="Get straight-line distance between two stops")
def get_distance(
    from_stop: str = Query(..., description="Name of the starting terminal"),
    to_stop: str = Query(..., description="Name of the destination terminal")
):
    if from_stop not in STOP_COORDINATES or to_stop not in STOP_COORDINATES:
        return {
            "error": "Invalid stop name. Check if spelling and spacing match expected format."
        }

    coord1 = STOP_COORDINATES[from_stop]
    coord2 = STOP_COORDINATES[to_stop]
    distance = haversine(coord1, coord2)

    
    route_match = db["ferry_schedules"].find_one({
        "stops.station": {"$all": [from_stop, to_stop]}
    }, {"route": 1, "_id": 0})

    return {
        "from": from_stop,
        "to": to_stop,
        "route": route_match["route"] if route_match else "Not found",
        "distance_km": distance
    }
