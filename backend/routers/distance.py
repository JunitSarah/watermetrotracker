from math import asin, cos, radians, sin, sqrt

from fastapi import APIRouter, HTTPException, Query

from database.connect import db
from utils import STATIONS, leg, normalize

router = APIRouter(tags=["distance"])


def haversine(coord1, coord2):
    lat1, lon1, lat2, lon2 = map(radians, [*coord1, *coord2])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    return round(2 * asin(sqrt(a)) * 6371, 2)  # Earth radius in km


def coords(name):
    return STATIONS[name]["lat"], STATIONS[name]["lng"]


@router.get("/distance", summary="Get straight-line distance between two stops")
def get_distance(
    from_stop: str = Query(..., description="Name of the starting terminal"),
    to_stop: str = Query(..., description="Name of the destination terminal"),
):
    a, b = normalize(from_stop), normalize(to_stop)
    if a not in STATIONS or b not in STATIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown stop. Valid stops: {', '.join(STATIONS)}",
        )

    route = next(
        (doc["route"] for doc in db["ferry_schedules"].find({}, {"_id": 0})
         if leg(doc, a, b)),
        "Not found",
    )
    return {"from": a, "to": b, "route": route,
            "distance_km": haversine(coords(a), coords(b))}