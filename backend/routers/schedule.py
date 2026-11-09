from fastapi import APIRouter, HTTPException, Query

from database.connect import db
from utils import normalize, trip_sequence

router = APIRouter(tags=["schedule"])


@router.get("/schedule", summary="Get Ferry Schedule", description="Returns schedule data for a given route.")
def get_schedule(route: str = Query(..., description="Route name like 'Vyttila-Kakkanad'")):
    data = list(db["ferry_schedules"].find(
        {"route": route},
        {"_id": 0, "route": 1, "boat_no": 1, "from": 1, "departure": 1,
         "to": 1, "arrival": 1, "batch": 1, "status": 1},
    ).sort("departure", 1))
    return {"schedule": data}


@router.get("/routes", summary="List Available Routes", description="Returns list of all route names.")
def get_routes():
    return {"routes": sorted(db["ferry_schedules"].distinct("route"))}


@router.get("/terminal-schedule", summary="Get Schedule by Terminal",
            description="Departures from a terminal (start point or intermediate stop), 07:00–20:59.")
def get_schedule_by_terminal(terminal: str = Query(..., description="Terminal name like 'High Court'")):
    terminal = normalize(terminal)
    results = []

    for doc in db["ferry_schedules"].find({}, {"_id": 0}):
        seq = trip_sequence(doc)
        names = [p["station"] for p in seq]
        # must stop here AND continue somewhere afterwards
        if terminal not in names or names.index(terminal) == len(names) - 1:
            continue

        i = names.index(terminal)
        departure = seq[i]["departure"]
        try:
            hour = int(departure.split(":")[0])
        except (AttributeError, ValueError):
            continue
        if not 7 <= hour <= 20:
            continue

        results.append({
            "boat_no": doc.get("boat_no"),
            "route": doc.get("route"),
            "batch": doc.get("batch"),
            "charging_slot": doc.get("charging_slot", False),
            "departure": departure,
            "to": seq[i + 1]["station"],
            "arrival": seq[i + 1]["arrival"],
        })

    if not results:
        raise HTTPException(status_code=404, detail=f"No departures from '{terminal}' between 07:00 and 20:59")

    results.sort(key=lambda r: r["departure"])
    return {"terminal": terminal, "schedule": results}