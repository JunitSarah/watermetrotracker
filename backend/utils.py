"""Shared constants and helpers used by several routers."""

# Single source of truth for stations. The frontend loads these from
# GET /api/stations, so names always match.
#   key     = short name used in schedules (the map shows it as "<name> Water Metro")
#   lat/lng = the terminal itself (Google Maps pin of each Water Metro terminal)
STATIONS = {
    "High Court":     {"lat": 9.983774,   "lng": 76.2730021},
    "Vypin":          {"lat": 9.9739962,  "lng": 76.2443103},
    "Fort Kochi":     {"lat": 9.968359,   "lng": 76.243178},
    "South Chittoor": {"lat": 10.038275,  "lng": 76.2697382},
    "Cheranalloor":   {"lat": 10.0724285, "lng": 76.2826862},
    "Eloor":          {"lat": 10.0738525, "lng": 76.2828956},
    "Vyttila":        {"lat": 9.9669687,  "lng": 76.3224493},
    "Kakkanad":       {"lat": 9.9924729,  "lng": 76.3512633},
}


def normalize(name: str) -> str:
    """Make user input like 'high court ' match 'High Court'."""
    return (name or "").strip().title()


def trip_sequence(doc: dict) -> list[dict]:
    """
    Return every point a trip visits, in order, as
    [{"station", "arrival", "departure"}, ...].

    A trip document stores its origin in `from`/`departure` and every
    following stop (including the final destination) in `stops`.
    """
    seq = [{
        "station": normalize(doc.get("from")),
        "arrival": None,
        "departure": doc.get("departure"),
    }]
    for stop in doc.get("stops", []):
        seq.append({
            "station": normalize(stop.get("station")),
            "arrival": stop.get("arrival"),
            "departure": stop.get("departure"),
        })
    return seq


def leg(doc: dict, from_station: str, to_station: str):
    """
    If this trip goes from `from_station` to `to_station` (in that order),
    return (departure_time_at_from, arrival_time_at_to). Otherwise None.
    """
    names = [p["station"] for p in trip_sequence(doc)]
    a, b = normalize(from_station), normalize(to_station)
    if a in names and b in names and names.index(a) < names.index(b):
        seq = trip_sequence(doc)
        return seq[names.index(a)]["departure"], seq[names.index(b)]["arrival"]
    return None