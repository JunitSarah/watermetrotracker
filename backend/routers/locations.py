from fastapi import APIRouter, Query

from database.connect import db
from utils import normalize, trip_sequence

router = APIRouter(tags=["locations"])


@router.get("/api/routes/from", summary="Get all unique locations")
def get_all_locations():
    locations = set()
    for doc in db["ferry_schedules"].find({}, {"_id": 0, "from": 1, "stops": 1}):
        for point in trip_sequence(doc):
            if point["station"]:
                locations.add(point["station"])
    return sorted(locations)


@router.get("/api/routes/to", summary="Get 'to' locations for a given 'from'")
def get_destinations(from_location: str = Query(...)):
    start = normalize(from_location)
    destinations = set()

    for doc in db["ferry_schedules"].find({}, {"_id": 0, "from": 1, "stops": 1}):
        names = [p["station"] for p in trip_sequence(doc)]
        if start in names:
            # every station *after* the start on this trip is reachable
            destinations.update(names[names.index(start) + 1:])

    destinations.discard(start)
    return sorted(destinations)