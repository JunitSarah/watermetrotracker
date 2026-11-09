import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { stationLabel } from '../utils/stations';

// Map is locked to Kerala: you can't pan or zoom out beyond the state.
const KERALA_BOUNDS = [[8.15, 74.80], [12.85, 77.45]];
const KOCHI_CENTER = [10.01, 76.29];

const boatIcon = new L.Icon({
  iconUrl: '/boat-icon.png',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

// Pin icons drawn as SVG, so we can colour them without image files.
const makePin = (color, size, opacity = 1) => L.divIcon({
  className: 'station-pin',
  html: `<svg width="${size}" height="${size * 1.5}" viewBox="0 0 24 36" style="opacity:${opacity}">
           <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z"
                 fill="${color}" stroke="#fff" stroke-width="1.5"/>
           <circle cx="12" cy="12" r="4.5" fill="#fff"/>
         </svg>`,
  iconSize: [size, size * 1.5],
  iconAnchor: [size / 2, size * 1.5],
  popupAnchor: [0, -size * 1.4],
  tooltipAnchor: [size / 2, -size],
});

const PINS = {
  normal: makePin('#0b5ed7', 24),          // nothing selected yet
  from: makePin('#16a34a', 34),            // selected start (green)
  to: makePin('#dc2626', 34),              // selected destination (red)
  onRoute: makePin('#0b5ed7', 26),         // stop the tracked boat passes
  dimmed: makePin('#64748b', 20, 0.45),    // not part of the selection
};

/** Zoom the map to fit the given points whenever they change. */
const FitBounds = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length >= 2) map.fitBounds(points, { padding: [140, 60], maxZoom: 15 });
    else if (points.length === 1) map.setView(points[0], 14);
  }, [map, points]);
  return null;
};

/**
 * stations:     { "High Court": [lat, lng], ... }
 * from, to:     selected station names ('' if not selected)
 * routePoints:  [[lat, lng], ...] for the tracked boat (empty if none)
 * routeStops:   station names along that route
 * boat:         { position, label, info } or null
 */
const TrackingMap = ({ stations, from, to, routePoints, routeStops, boat }) => {
  const anySelected = Boolean(from || to);

  const pinFor = name => {
    if (name === from) return PINS.from;
    if (name === to) return PINS.to;
    if (routeStops.includes(name)) return PINS.onRoute;
    return anySelected ? PINS.dimmed : PINS.normal;
  };

  // What the map zooms to: the boat's route > From/To > all stations.
  const focus = useMemo(() => {
    if (routePoints.length >= 2) return routePoints;
    const picked = [from, to].filter(n => stations[n]).map(n => stations[n]);
    if (picked.length) return picked;
    return Object.values(stations);
  }, [routePoints, from, to, stations]);

  return (
    <MapContainer
      center={KOCHI_CENTER}
      zoom={12}
      minZoom={7}
      maxBounds={KERALA_BOUNDS}
      maxBoundsViscosity={1.0}
      className="tracking-map"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
        bounds={KERALA_BOUNDS}
      />

      {Object.entries(stations).map(([name, pos]) => {
        const highlighted = name === from || name === to;
        return (
          <Marker
            key={`${name}-${from}-${to}-${routeStops.join()}`}   // re-render icon on selection change
            position={pos}
            icon={pinFor(name)}
            zIndexOffset={highlighted ? 500 : 0}
          >
            <Tooltip permanent={highlighted} direction={name === to ? 'right' : 'top'}>
              {name === from ? `From: ${stationLabel(name)}`
                : name === to ? `To: ${stationLabel(name)}`
                : stationLabel(name)}
            </Tooltip>
          </Marker>
        );
      })}

      {routePoints.length >= 2 && (
        <Polyline positions={routePoints} pathOptions={{ color: '#00b4d8', weight: 5, dashArray: '8 8' }} />
      )}

      {boat && (
        <Marker position={boat.position} icon={boatIcon} zIndexOffset={1000}>
          <Popup><strong>{boat.label}</strong><br />{boat.info}</Popup>
        </Marker>
      )}

      <FitBounds points={focus} />
    </MapContainer>
  );
};

export default TrackingMap;