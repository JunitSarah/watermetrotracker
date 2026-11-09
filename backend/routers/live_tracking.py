from fastapi import APIRouter, Query

from database.connect import db
from utils import normalize, trip_sequence

router = APIRouter(tags=["live-tracking"])


@router.get("/api/live-tracking", summary="Get ferries running From → To")
def get_live_tracking(
    from_location: str = Query(..., description="From location"),
    to_location: str = Query(..., description="To location"),
):
    start, end = normalize(from_location), normalize(to_location)
    boats = []

    for doc in db["ferry_schedules"].find({}, {"_id": 0}):
        seq = trip_sequence(doc)
        names = [p["station"] for p in seq]
        if start not in names or end not in names:
            continue
        i, j = names.index(start), names.index(end)
        if i >= j:
            continue  # this trip goes the other way

        boats.append({
            "boat_id": doc.get("boat_no", "N/A"),
            "departure_time": seq[i]["departure"] or "N/A",
            "arrival_time": seq[j]["arrival"] or "N/A",
            "route": doc.get("route", ""),
            # every station the boat passes, from start to end (used by the map)
            "stops": names[i:j + 1],
        })

    boats.sort(key=lambda b: b["departure_time"])
    return {"boats": boats}