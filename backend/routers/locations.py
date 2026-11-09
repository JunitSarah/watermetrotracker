from fastapi import APIRouter, Query
from database.connect import db  

router = APIRouter()


@router.get("/api/routes/from", summary="Get all unique locations")
def get_all_locations():
    from_values = db["ferry_schedules"].distinct("from")
    to_values = db["ferry_schedules"].distinct("to")

    stop_values = set()
    for doc in db["ferry_schedules"].find({"stops": {"$exists": True}}):
        for stop in doc.get("stops", []):
            station = stop.get("station")
            if station:
                stop_values.add(station.strip().title())

    all_locations = set()
    for loc in from_values + to_values:
        if loc:
            all_locations.add(loc.strip().title())

    all_locations.update(stop_values)

    return sorted(all_locations)



@router.get("/api/routes/to", summary="Get 'to' locations for a given 'from'")
def get_destinations(from_location: str = Query(..., alias="from_location")):
    from_title = from_location.strip().title()

    matched_docs = db["ferry_schedules"].find({
        "$or": [
            {"from": from_title},
            {"stops.station": from_title}
        ]
    })

    destinations = set()

    for doc in matched_docs:
        
        if doc.get("to") and doc["to"].strip().title() != from_title:
            destinations.add(doc["to"].strip().title())

        
        if doc.get("from", "").strip().title() == from_title:
            found = False
            for stop in doc.get("stops", []):
                if found:
                    destinations.add(stop["station"].strip().title())
                elif stop["station"].strip().title() == from_title:
                    found = True

        
        elif "stops" in doc:
            stops = doc["stops"]
            for i, stop in enumerate(stops):
                if stop["station"].strip().title() == from_title:
                    for next_stop in stops[i + 1:]:
                        destinations.add(next_stop["station"].strip().title())
                    break

    return sorted(destinations)
