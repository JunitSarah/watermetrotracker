from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import (
    locations,
    schedule,
    update,
    distance,
    alerts,
    live_tracking,
    stations,
)

from database.connect import db

app = FastAPI(
    title="Kochi Water Metro API",
    version="1.0",
    description="Backend API for Kochi Water Metro Schedule and Tracking App",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(locations.router)
app.include_router(schedule.router)
app.include_router(update.router)
app.include_router(distance.router)
app.include_router(alerts.router)
app.include_router(live_tracking.router)
app.include_router(stations.router)


@app.get("/")
def read_root():
    return {"message": "Hello from Water Metro Backend!"}


@app.get("/database-test")
def database_test():
    db.command("ping")
    return {
        "message": "MongoDB connected successfully!",
        "database": db.name,
        "collections": db.list_collection_names(),
    }