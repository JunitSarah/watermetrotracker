# <div align="center">

# Water Metro Tracker
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

> Real-time Kochi Water Metro schedules, live ferry tracking, and stop-to-stop distances — all in one place.

</div>

## 🔗 Overview
The **Water Metro Tracker** is a full-stack web application built to help commuters navigate the Kochi Water Metro. It surfaces ferry schedules, live boat tracking between stops, route distances, and service alerts through a FastAPI backend backed by MongoDB, with a React frontend for browsing routes on an interactive map.

## 🔗 The Problem
Commuters relying on the Kochi Water Metro currently have limited ways to:
- Quickly check which ferries run between two specific stops
- See live tracking of ferries currently in transit
- Get straight-line distance and route info between terminals
- Receive real-time service alerts

This project brings all of that together in a single, easy-to-use tracker.

## 🔗 Core Features
| Feature | Description |
|---|---|
| **Live Ferry Tracking** | Real-time lookup of boats currently running between two locations |
| **Schedule Lookup** | Get full schedules by route name or by terminal |
| **Route Discovery** | List all available routes and valid destinations from any stop |
| **Distance Calculator** | Haversine-based straight-line distance between any two stops |
| **Service Alerts** | Post and view real-time service alerts |
| **Interactive Map** | Leaflet-based map view of routes and stops |

---

## 🔗 Architecture
### System Workflow
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1.    User selects From → To stops on the frontend         │
│                        │                                    │
│                        ▼                                    │
│  2.    React app calls FastAPI endpoints                    │
│                        │                                    │
│                        ▼                                    │
│  3.    FastAPI routers query MongoDB (ferry_schedules,      │
│        ferry_locations, alerts)                             │
│                        │                                    │
│                        ▼                                    │
│  4.    Distance / schedule / live-tracking data computed    │
│                        │                                    │
│                        ▼                                    │
│  5.    Response returned to frontend                        │
│                        │                                    │
│                        ▼                                    │
│  6.    Rendered on route list, schedule table, and map view │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🔗 Tech Stack
| Layer | Technology |
|---|---|
| **Backend** | Python 3.10+, FastAPI |
| **Database Access** | PyMongo |
| **Database** | MongoDB |
| **Frontend** | React 19, React Router |
| **Mapping** | Leaflet, React-Leaflet, Geolib |
| **UI Extras** | React Simple Typewriter |

## 🔗 Project Structure
```
watermetrotracker/
│
├── backend/
│   ├── database/
│   │   └── connect.py          # MongoDB connection (water_metro DB)
│   ├── routers/
│   │   ├── locations.py        # Available from/to locations
│   │   ├── schedule.py         # Route schedules, terminal schedules
│   │   ├── distance.py         # Haversine distance between stops
│   │   ├── update.py           # Update live ferry location
│   │   ├── alerts.py           # Post/get service alerts
│   │   └── live_tracking.py    # Live ferry tracking between two points
│   ├── insert_ferries.js       # Seed script — ferry data
│   ├── insert_schedules.js     # Seed script — schedule data
│   └── main.py                 # FastAPI app entry point
│
└── frontend/
    ├── public/
    └── src/
        ├── api/                # API call functions
        ├── assets/
        ├── components/
        ├── pages/
        ├── App.js
        ├── AppRouter.jsx
        └── index.js
```

## 🔗 Prerequisites
Before getting started, make sure you have the following installed:
- **Python 3.10+** — [Download here](https://www.python.org/downloads/)
- **pip** — comes bundled with Python
- **Node.js and npm** — [Download here](https://nodejs.org/)
- **MongoDB** — running locally on the default port (`mongodb://localhost:27017`)
- **Git** — [Download here](https://git-scm.com/)

## 🔗 Local Setup
**1. Clone the repository**
```bash
git clone https://github.com/JunitSarah/watermetrotracker.git
cd watermetrotracker/watermetrotracker
```

**2. Backend setup**
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install fastapi uvicorn pymongo
```

**3. Seed the database**
```bash
node insert_ferries.js
node insert_schedules.js
```

**4. Frontend setup**
```bash
cd ../frontend
npm install
```

## 🔗 Running the Application
**Start the backend API**
```bash
cd backend
uvicorn main:app --reload
```
Runs at `http://localhost:8000`.

**Start the frontend**
```bash
cd frontend
npm start
```
Runs at `http://localhost:3000`.

## 🔗 Usage Guide
### API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/api/routes/from` | Get all unique locations (from, to, and stops) |
| GET | `/api/routes/to?from_location=` | Get valid destinations from a given location |
| GET | `/schedule?route=` | Get schedule data for a specific route |
| GET | `/routes` | List all available route names |
| GET | `/terminal-schedule?terminal=` | Get schedule (7 AM–8 PM) for a given terminal |
| GET | `/distance?from_stop=&to_stop=` | Get distance (km) and matching route between two stops |
| GET | `/api/live-tracking?from_location=&to_location=` | Get live boats currently running between two locations |
| POST | `/update-location` | Update a ferry's live latitude/longitude/speed |
| POST | `/alerts` | Post a service alert |
| GET | `/alerts` | Get all posted alerts |

### Example: Checking Live Tracking
```
GET /api/live-tracking?from_location=Vyttila&to_location=Kakkanad

{
  "boats": [
    { "boat_id": "B12", "departure_time": "09:15", "arrival_time": "09:45", "route": "Vyttila-Kakkanad" }
  ]
}
```

## 🔗 Notes
- CORS is currently open to all origins (`allow_origins=["*"]`) — restrict this before deploying to production.
- Stop coordinates used for the distance calculation are currently hardcoded in `distance.py` (High Court, Vypin, Fort Kochi, Cheranalloor, Eloor, South Chittoor, Kakkanad, Vyttila).

## 🔗 Contributing
Contributions, issues, and feature requests are welcome!
1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

<div align="center">

⭐ If this project helped you, consider giving it a star!

</div>
