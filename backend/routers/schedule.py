from fastapi import APIRouter, Query, HTTPException
from database.connect import db

router = APIRouter(tags=["schedule"])

@router.get("/schedule", summary="Get Ferry Schedule", description="Returns schedule data for a given route.")
def get_schedule(route: str = Query(..., description="Route name like 'Vyttila-Kakkanad'")):
    data = list(db["ferry_schedules"].find(
        {"route": route},
        {
            "_id": 0,
            "route": 1,
            "boat_no": 1,
            "from": 1,
            "departure": 1,
            "to": 1,
            "arrival": 1,
            "batch": 1,
            "status": 1
        }
    ))
    return {"schedule": data}


@router.get("/routes", summary="List Available Routes", description="Returns list of all route names.")
def get_routes():
    routes = db["ferry_schedules"].distinct("route")
    return {"routes": routes}


@router.get("/terminal-schedule", summary="Get Schedule by Terminal", description="Returns schedule where terminal is either starting point or a stop.")
def get_schedule_by_terminal(
    terminal: str = Query(..., description="Enter terminal name like 'High Court'")
):
    terminal = terminal.strip()

    docs = list(db["ferry_schedules"].find({
        "$or": [
            {"from": terminal},
            {"stops.station": terminal}
        ]
    }))

    if not docs:
        raise HTTPException(status_code=404, detail=f"No schedules found for terminal '{terminal}'")

    results = []

    for doc in docs:
        entry = {
            "boat_no": doc.get("boat_no"),
            "route": doc.get("route"),
            "batch": doc.get("batch"),
            "charging_slot": doc.get("charging_slot", False)
        }

        if doc.get("from") == terminal:
            entry["departure"] = doc.get("departure")
            if doc.get("stops"):
                entry["to"] = doc["stops"][0].get("station")
                entry["arrival"] = doc["stops"][0].get("arrival")
        else:
            
            for idx, stop in enumerate(doc.get("stops", [])):
                if stop.get("station") == terminal:
                    entry["departure"] = stop.get("departure")
                    
                    if idx + 1 < len(doc["stops"]):
                        entry["to"] = doc["stops"][idx + 1].get("station")
                        entry["arrival"] = doc["stops"][idx + 1].get("arrival")
                    break

        
        if "departure" in entry:
            try:
                hour = int(entry["departure"].split(":")[0])
                if 7 <= hour <= 20:
                    results.append(entry)
            except:
                continue

    if not results:
        raise HTTPException(status_code=404, detail=f"No results for terminal '{terminal}' between 07:00 and 20:00")

    return {"terminal": terminal, "schedule": results}
