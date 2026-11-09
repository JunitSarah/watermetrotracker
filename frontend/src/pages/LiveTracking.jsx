import React, { useState, useEffect, useMemo } from 'react';
import API_BASE_URL from '../api/config';
import TrackingMap from '../components/TrackingMap';
import { stationLabel, toMinutes, nowMinutes, tripStatus } from '../utils/stations';
import './LiveTracking.css';

// Fake movement: every TICK_MS the boat jumps 1/STEPS of the way along its route.
const TICK_MS = 3000;   // move every 3 seconds
const STEPS = 10;       // 10 jumps from start to destination (~30 s per trip)

const distanceKm = ([lat1, lon1], [lat2, lon2]) => {
  const toRad = deg => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/** Where the boat is after travelling `travelled` km along `points`. */
const positionAlong = (points, travelled) => {
  let remaining = travelled;
  for (let i = 0; i < points.length - 1; i++) {
    const segment = distanceKm(points[i], points[i + 1]);
    if (remaining <= segment) {
      const t = segment === 0 ? 1 : remaining / segment;
      return {
        position: [
          points[i][0] + t * (points[i + 1][0] - points[i][0]),
          points[i][1] + t * (points[i + 1][1] - points[i][1]),
        ],
        nextStopIndex: i + 1,
      };
    }
    remaining -= segment;
  }
  return { position: points[points.length - 1], nextStopIndex: points.length - 1 };
};

/** For a boat that already left: how far along (0..1) the timetable says it is now. */
const scheduledProgress = (boat, now) => {
  const dep = toMinutes(boat.departure_time);
  const arr = toMinutes(boat.arrival_time);
  if (!(arr > dep)) return 0;
  return Math.min(Math.max((now - dep) / (arr - dep), 0), 1);
};

const badgeText = ({ status, minutesAway }, boat) => {
  if (status === 'departed') return `Departed ${boat.departure_time}`;
  if (status === 'now') return 'Departing now';
  return minutesAway <= 60 ? `In ${minutesAway} min` : `At ${boat.departure_time}`;
};

const LiveTracking = () => {
  const [stations, setStations] = useState({});   // { "High Court": [lat, lng], ... }
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [fromOptions, setFromOptions] = useState([]);
  const [toOptions, setToOptions] = useState([]);
  const [boats, setBoats] = useState([]);
  const [searched, setSearched] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedBoat, setSelectedBoat] = useState(null);
  const [progress, setProgress] = useState(0);     // 0 = at start, 1 = arrived
  const [paused, setPaused] = useState(false);
  const [now, setNow] = useState(nowMinutes());     // current time, minutes since midnight

  // Refresh "now" every 30 s so the list updates (upcoming → departed → hidden).
  useEffect(() => {
    const clock = setInterval(() => setNow(nowMinutes()), 30000);
    return () => clearInterval(clock);
  }, []);

  // Load stations (for the map) and the "From" list once.
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/stations`)
      .then(res => res.json())
      .then(data => setStations(Object.fromEntries(data.map(s => [s.name, [s.lat, s.lng]]))))
      .catch(err => console.error(err));

    fetch(`${API_BASE_URL}/api/routes/from`)
      .then(res => res.json())
      .then(data => setFromOptions(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error(err);
        setMessage(`⚠ Cannot reach the backend at ${API_BASE_URL}. Is it running?`);
      });
  }, []);

  // New "From" → reload destinations and clear old results.
  useEffect(() => {
    setTo('');
    setBoats([]);
    setSearched(false);
    setSelectedBoat(null);
    if (!from) {
      setToOptions([]);
      return;
    }
    fetch(`${API_BASE_URL}/api/routes/to?from_location=${encodeURIComponent(from)}`)
      .then(res => res.json())
      .then(data => setToOptions(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, [from]);

  const trackBoat = (boat, t = nowMinutes()) => {
    setSelectedBoat(boat);
    // a departed boat starts where the timetable says it is; others start at the station
    setProgress(tripStatus(boat, t).status === 'departed' ? scheduledProgress(boat, t) : 0);
    setPaused(false);
  };

  const handleSubmit = () => {
    if (!from || !to) {
      setMessage('Please select both From and To.');
      return;
    }
    setSelectedBoat(null);
    fetch(`${API_BASE_URL}/api/live-tracking?from_location=${encodeURIComponent(from)}&to_location=${encodeURIComponent(to)}`)
      .then(res => res.json())
      .then(data => {
        const t = nowMinutes();
        const list = (Array.isArray(data.boats) ? data.boats : [])
          .filter(b => tripStatus(b, t).status !== 'completed');   // hide finished trips
        setNow(t);
        setBoats(list);
        setSearched(true);
        setMessage('');
        // start fake-tracking straight away: the next ferry to leave, else one on the way
        const next = list.find(b => tripStatus(b, t).status !== 'departed') || list[0];
        if (next) trackBoat(next, t);
      })
      .catch(err => {
        console.error(err);
        setMessage('⚠ Error fetching data.');
        setBoats([]);
      });
  };

  // Ferries to show right now (finished trips drop off as time passes).
  const visibleBoats = boats
    .map(boat => ({ boat, info: tripStatus(boat, now) }))
    .filter(({ info }) => info.status !== 'completed');

  // Route the selected boat follows: its stops (or just from/to as a fallback).
  const routeStops = useMemo(
    () => (selectedBoat ? (selectedBoat.stops?.length ? selectedBoat.stops : [from, to]) : []),
    [selectedBoat, from, to]
  );
  const routePoints = useMemo(
    () => routeStops.map(name => stations[name]).filter(Boolean),
    [routeStops, stations]
  );
  const totalKm = useMemo(
    () => routePoints.slice(1).reduce((sum, p, i) => sum + distanceKm(routePoints[i], p), 0),
    [routePoints]
  );
  const travelled = progress * totalKm;
  const arrived = Boolean(selectedBoat) && progress >= 1;

  // THE TRACKER: every 3 seconds, move the boat one step forward.
  useEffect(() => {
    if (!selectedBoat || paused || arrived || routePoints.length < 2) return;
    const timer = setInterval(() => setProgress(p => Math.min(p + 1 / STEPS, 1)), TICK_MS);
    return () => clearInterval(timer);
  }, [selectedBoat, paused, arrived, routePoints]);

  let boatOnMap = null;
  let status = null;
  if (selectedBoat && routePoints.length >= 2) {
    const { position, nextStopIndex } = positionAlong(routePoints, travelled);
    const remaining = Math.max(totalKm - travelled, 0).toFixed(2);
    const nextStop = stationLabel(routeStops[nextStopIndex]);
    status = arrived
      ? `✅ ${selectedBoat.boat_id} has arrived at ${stationLabel(to)}`
      : `🛥 ${selectedBoat.boat_id} → next stop ${nextStop} · ${remaining} km to ${stationLabel(to)} · ${Math.round(progress * 100)}%`;
    boatOnMap = {
      position,
      label: `Boat ${selectedBoat.boat_id}`,
      info: arrived ? `Arrived at ${stationLabel(to)}` : `${remaining} km to ${stationLabel(to)}`,
    };
  }

  return (
    <div className="tracking-container">
      <h2>Live Tracking</h2>

      <div className="dropdowns">
        <label>From:</label>
        <select value={from} onChange={e => setFrom(e.target.value)}>
          <option value="">-- Select From --</option>
          {fromOptions.map(loc => <option key={loc} value={loc}>{stationLabel(loc)}</option>)}
        </select>

        <label>To:</label>
        <select value={to} onChange={e => setTo(e.target.value)} disabled={!from}>
          <option value="">-- Select To --</option>
          {toOptions.map(loc => <option key={loc} value={loc}>{stationLabel(loc)}</option>)}
        </select>

        <button onClick={handleSubmit}>Enter</button>
      </div>

      {message && <p className="notice">{message}</p>}

      <div className="tracking-layout">
        {searched && (
          <div className="boat-list">
            <h3>Ferries now &amp; later today</h3>
            {visibleBoats.length === 0 ? (
              <p className="hint">No more ferries on this route today.</p>
            ) : (
              <>
                <p className="hint">Tracking starts automatically. Click another ferry to switch.</p>
                <ul>
                  {visibleBoats.map(({ boat, info }, i) => (
                    <li
                      key={`${boat.boat_id}-${boat.departure_time}-${i}`}
                      onClick={() => trackBoat(boat)}
                      className={`${info.status} ${selectedBoat === boat ? 'selected' : ''}`}
                    >
                      <div className="boat-row">
                        <span><strong>{boat.boat_id}</strong> · {boat.departure_time} → {boat.arrival_time}</span>
                        <span className={`badge ${info.status}`}>{badgeText(info, boat)}</span>
                      </div>
                      <div className="route-name">{boat.route}</div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        <div className="map-panel">
          {status ? (
            <div className="tracking-status">
              <span>{status}</span>
              {!arrived && (
                <button onClick={() => setPaused(p => !p)}>{paused ? '▶ Resume' : '⏸ Pause'}</button>
              )}
              <button onClick={() => { setProgress(0); setPaused(false); }}>↺ Restart</button>
            </div>
          ) : (
            <div className="tracking-status">Select From and To, then press Enter to start tracking.</div>
          )}
          <TrackingMap
            stations={stations}
            from={from}
            to={to}
            routePoints={routePoints}
            routeStops={routeStops}
            boat={boatOnMap}
          />
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;