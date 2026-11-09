// Display name for a station. The backend/database keep the plain name
// ("Kakkanad"); users see the metro station name ("Kakkanad Water Metro").
export const stationLabel = name => (name ? `${name} Water Metro` : '');

// "HH:MM" -> minutes since midnight
export const toMinutes = hhmm => {
  const [h, m] = (hhmm || '').split(':').map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : NaN;
};

export const nowMinutes = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

/**
 * Status of a trip compared with the current time:
 *   'completed' - already arrived (hidden from the list)
 *   'departed'  - left the From station, still on the way (shown greyed)
 *   'now'       - departing this minute
 *   'upcoming'  - departs later; minutesAway says how soon
 */
export const tripStatus = (boat, now = nowMinutes()) => {
  const dep = toMinutes(boat.departure_time);
  const arr = toMinutes(boat.arrival_time);
  if (arr < now) return { status: 'completed' };
  if (dep < now) return { status: 'departed' };
  if (dep === now) return { status: 'now' };
  return { status: 'upcoming', minutesAway: dep - now };
};