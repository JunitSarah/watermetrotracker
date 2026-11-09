"""
Fill MongoDB with sample Kochi Water Metro data.

    python seed.py

Safe to run again: it wipes and rebuilds the ferry_schedules and
ferry_locations collections every time (alerts are left alone).

The timetable is SAMPLE data generated from the route list below - edit
ROUTES to match the real timetable if you have it.
"""
from datetime import datetime, timedelta
from itertools import cycle

from database.connect import db

# route name -> list of (station, minutes from the previous station)
ROUTES = {
    "High Court-Vypin-Fort Kochi": [("High Court", 0), ("Vypin", 15), ("Fort Kochi", 10)],
    "Vyttila-Kakkanad": [("Vyttila", 0), ("Kakkanad", 25)],
    "High Court-Eloor": [("High Court", 0), ("South Chittoor", 25), ("Cheranalloor", 10), ("Eloor", 10)],
}
FIRST_TRIP, LAST_TRIP = "07:00", "20:00"
EVERY_MINUTES = 30
DWELL_MINUTES = 2  # time a boat waits at an intermediate stop

BOATS = cycle([f"WM-{n:02d}" for n in range(1, 19) if n != 5])

FERRY_POSITIONS = [
    ("WM-01", 9.98411858920008, 76.2724145315588), ("WM-02", 9.98394189868122, 76.272536823526),
    ("WM-03", 9.96880937833339, 76.2431094702333), ("WM-04", 9.98360238969326, 76.2727483827621),
    ("WM-06", 9.98335581666667, 76.2730375666667), ("WM-07", 10.0382134644315, 76.2692988943309),
    ("WM-08", 9.96671228333333, 76.32254975), ("WM-09", 9.98435485, 76.2726759833333),
    ("WM-10", 9.98325407970697, 76.2709912844002), ("WM-11", 9.97183197643608, 76.248471038416),
    ("WM-12", 9.9666348611936, 76.322592459619), ("WM-13", 9.97873367741704, 76.2606086209416),
    ("WM-14", 9.98432905878872, 76.2726489733905), ("WM-15", 9.9541007, 76.2868621166667),
    ("WM-16", 9.96669221666667, 76.3225585833333), ("WM-17", 9.96690458333333, 76.3228107333333),
    ("WM-18", 9.97779823333333, 76.3279708),
]


def hhmm(t: datetime) -> str:
    return t.strftime("%H:%M")


def batch_for(t: datetime) -> str:
    return "Morning" if t.hour < 12 else "Afternoon" if t.hour < 17 else "Evening"


def build_trips(name, legs, start):
    """One trip in the format the API expects."""
    t = start
    stops = []
    for i, (station, minutes) in enumerate(legs[1:], start=1):
        t += timedelta(minutes=minutes)
        last = i == len(legs) - 1
        stops.append({
            "station": station,
            "arrival": hhmm(t),
            "departure": None if last else hhmm(t + timedelta(minutes=DWELL_MINUTES)),
        })
        if not last:
            t += timedelta(minutes=DWELL_MINUTES)
    return {
        "route": name,
        "boat_no": next(BOATS),
        "batch": batch_for(start),
        "from": legs[0][0],
        "departure": hhmm(start),
        "to": legs[-1][0],
        "arrival": stops[-1]["arrival"],
        "stops": stops,
        "status": "Scheduled",
        "charging_slot": start.minute == 0 and start.hour % 3 == 0,
    }


def reversed_legs(legs):
    stations = [s for s, _ in legs][::-1]
    gaps = [m for _, m in legs][1:][::-1]
    return list(zip(stations, [0] + gaps))


def main():
    first = datetime.strptime(FIRST_TRIP, "%H:%M")
    last = datetime.strptime(LAST_TRIP, "%H:%M")

    trips = []
    for name, legs in ROUTES.items():
        back_legs = reversed_legs(legs)
        back_name = "-".join(reversed(name.split("-")))  # "A-B-C" -> "C-B-A"
        t = first
        while t <= last:
            trips.append(build_trips(name, legs, t))
            trips.append(build_trips(back_name, back_legs, t))
            t += timedelta(minutes=EVERY_MINUTES)

    db.ferry_schedules.drop()
    db.ferry_schedules.insert_many(trips)
    db.ferry_schedules.create_index("route")

    db.ferry_locations.drop()
    db.ferry_locations.insert_many(
        [{"id": i, "lat": lat, "lng": lng, "speed": "N/A"} for i, lat, lng in FERRY_POSITIONS]
    )

    print(f"Inserted {len(trips)} trips on {len(ROUTES) * 2} routes "
          f"and {len(FERRY_POSITIONS)} ferry positions into '{db.name}'.")


if __name__ == "__main__":
    main()