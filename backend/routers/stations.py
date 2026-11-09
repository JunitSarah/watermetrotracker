from fastapi import APIRouter

from utils import STATIONS

router = APIRouter(tags=["stations"])


@router.get("/api/stations", summary="All stations with coordinates")
def get_stations():
    return [{"name": name, **info} for name, info in STATIONS.items()]