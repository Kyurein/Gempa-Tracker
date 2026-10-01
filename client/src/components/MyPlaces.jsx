import { useState } from "react";
import { addPlace, deletePlace } from "../api.js";
import { magColor, timeAgo } from "../quake.js";

const EMPTY = { name: "", latitude: "", longitude: "", radius_km: 100 };

export default function MyPlaces({ user, places, nearby, onChange, onSelect, onLogout }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  function useMyLocation() {
    if (!navigator.geolocation) return setError("Your browser can't share its location");
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm((f) => ({
        ...f,
        latitude: pos.coords.latitude.toFixed(4),
        longitude: pos.coords.longitude.toFixed(4),
      })),
      () => setError("Location access was blocked. Enter coordinates instead.")
    );
  }

  async function save(e) {
    e.preventDefault();
    setError("");
    try {
      await addPlace({
        name: form.name,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        radius_km: Number(form.radius_km),
      });
      setForm(EMPTY);
      onChange();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(id) {
    try {
      await deletePlace(id);
      onChange();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="panel">
      <div className="account">
        <span>{user.email}</span>
        <button className="link" onClick={onLogout}>Log out</button>
      </div>

      <h2>My places</h2>
      {places.length === 0 ? (
        <p className="hint">Add a place, like your home or campus, to see earthquakes near it.</p>
      ) : (
        <ul className="places">
          {places.map((p) => (
            <li key={p.id}>
              <span><strong>{p.name}</strong> within {p.radius_km} km</span>
              <button className="link danger" onClick={() => remove(p.id)} aria-label={`Remove ${p.name}`}>Remove</button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={save} className="stack add-place">
        <label>
          Place name
          <input value={form.name} onChange={update("name")} placeholder="e.g. Rumah Bandung" required maxLength={50} />
        </label>
        <div className="row">
          <label>
            Latitude
            <input type="number" step="any" value={form.latitude} onChange={update("latitude")} required />
          </label>
          <label>
            Longitude
            <input type="number" step="any" value={form.longitude} onChange={update("longitude")} required />
          </label>
        </div>
        <button type="button" className="link" onClick={useMyLocation}>Use my current location</button>
        <label>
          Alert radius: {form.radius_km} km
          <input type="range" min="10" max="500" step="10" value={form.radius_km} onChange={update("radius_km")} />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="primary">Save place</button>
      </form>

      <h2>Near your places (last 30 days)</h2>
      {places.length > 0 && nearby.length === 0 && (
        <p className="hint">No earthquakes near your places in the last 30 days.</p>
      )}
      <ul className="quake-list">
        {nearby.map((q) => (
          <li key={q.id}>
            <button className="quake-row" onClick={() => onSelect(q)}>
              <span className="mag-chip" style={{ background: magColor(q.magnitude) }}>{q.magnitude.toFixed(1)}</span>
              <span className="row-text">
                <span className="row-region">{q.distance_km} km from {q.place_name}</span>
                <span className="row-meta">{timeAgo(q.occurred_at)}, {q.region}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
