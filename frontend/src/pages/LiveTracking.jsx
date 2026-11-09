import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const boatIcon = new L.Icon({
  iconUrl: '/boat-icon.png', 
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});


const terminalCoordinates = {
  Vypin: [9.9876, 76.2290],
  Vyttila: [9.9630, 76.3085],
  Highcourt: [9.9823, 76.2789],
  Kakkanad: [9.9977, 76.3123],
  Cheranalloor: [10.0271, 76.2803],
  Eloor: [10.0445, 76.3052],
  FortKochi: [9.9663, 76.2426],
  SouthChittoor: [10.0153, 76.2776],
};

const LiveTracking = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [fromOptions, setFromOptions] = useState([]);
  const [toOptions, setToOptions] = useState([]);
  const [boats, setBoats] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedBoat, setSelectedBoat] = useState(null);
  const [boatPosition, setBoatPosition] = useState(null);

  
  useEffect(() => {
    fetch('http://localhost:8000/api/routes/from')
      .then(res => res.json())
      .then(data => setFromOptions(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, []);

  
  useEffect(() => {
    if (!from) {
      setToOptions([]);
      setTo('');
      return;
    }

    fetch(`http://localhost:8000/api/routes/to?from_location=${encodeURIComponent(from)}`)
      .then(res => res.json())
      .then(data => setToOptions(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, [from]);

  
  const handleSubmit = () => {
    if (!from || !to) {
      setMessage('Please select both From and To.');
      setBoats([]);
      return;
    }

    fetch(`http://localhost:8000/api/live-tracking?from_location=${encodeURIComponent(from)}&to_location=${encodeURIComponent(to)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.boats)) {
          setBoats(data.boats);
          setMessage('');
        } else {
          setBoats([]);
          setMessage('❌ No ferries found.');
        }
      })
      .catch(err => {
        console.error(err);
        setMessage('⚠ Error fetching data.');
        setBoats([]);
      });
  };

  
  useEffect(() => {
    if (!selectedBoat || !terminalCoordinates[from] || !terminalCoordinates[to]) return;

    const [startLat, startLng] = terminalCoordinates[from];
    const [endLat, endLng] = terminalCoordinates[to];
    let progress = 0;

    const interval = setInterval(() => {
      progress += 0.02;
      if (progress >= 1) {
        clearInterval(interval);
        return;
      }
      const lat = startLat + progress * (endLat - startLat);
      const lng = startLng + progress * (endLng - startLng);
      setBoatPosition([lat, lng]);
    }, 500);

    return () => clearInterval(interval);
  }, [selectedBoat, from, to]);

  
  const calculateDistance = (fromCoords, toCoords) => {
    const [lat1, lon1] = fromCoords;
    const [lat2, lon2] = toCoords;
    const toRad = deg => (deg * Math.PI) / 180;
    const R = 6371; 

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return (R * c).toFixed(2);
  };

  return (
    <div>
      <h2>Live Tracking</h2>

      {/* 🔸 Dropdowns */}
      <div>
        <label>From: </label>
        <select value={from} onChange={e => setFrom(e.target.value)}>
          <option value="">-- Select From --</option>
          {fromOptions.map((loc, i) => <option key={i} value={loc}>{loc}</option>)}
        </select>

        <label>To: </label>
        <select value={to} onChange={e => setTo(e.target.value)} disabled={!from}>
          <option value="">-- Select To --</option>
          {toOptions.map((loc, i) => <option key={i} value={loc}>{loc}</option>)}
        </select>

        <button onClick={handleSubmit}>Enter</button>
        {message && <p>{message}</p>}
      </div>

      {/* 🔸 Boat List */}
      {boats.length > 0 && (
        <div>
          <h3>Available Ferries:</h3>
          <ul>
            {boats.map((boat, i) => (
              <li
                key={i}
                onClick={() => setSelectedBoat(boat)}
                style={{ cursor: 'pointer', marginBottom: '6px' }}
              >
                🛥 Boat: <strong>{boat.boat_no}</strong> — Departs at: <strong>{boat.departure || boat.departure_time || 'N/A'}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 🔸 Map Display */}
      {selectedBoat && boatPosition && (
        <MapContainer
          center={terminalCoordinates[from]}
          zoom={14}
          style={{ height: '400px', marginTop: '20px' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Terminal Markers */}
          <Marker position={terminalCoordinates[from]} />
          <Marker position={terminalCoordinates[to]} />

          {/* Boat Marker with Distance Popup */}
          <Marker position={boatPosition} icon={boatIcon}>
            <Popup>
              📍 {calculateDistance(boatPosition, terminalCoordinates[to])} km remaining
            </Popup>
          </Marker>

          {/* Line Between Terminals */}
          <Polyline positions={[terminalCoordinates[from], terminalCoordinates[to]]} color="blue" />
        </MapContainer>
      )}
    </div>
  );
};

export default LiveTracking;
