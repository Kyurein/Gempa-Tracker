import { magColor, timeAgo } from "../quake.js";

export default function QuakeList({ quakes, onSelect }) {
  if (quakes.length === 0) {
    return (
      <p className="empty">
        No earthquakes match this filter yet. Try a lower magnitude, or wait for the
        next update from BMKG.
      </p>
    );
  }
  return (
    <ul className="quake-list">
      {quakes.map((q) => (
        <li key={q.id}>
          <button className="quake-row" onClick={() => onSelect(q)}>
            <span className="mag-chip" style={{ background: magColor(q.magnitude) }}>
              {q.magnitude.toFixed(1)}
            </span>
            <span className="row-text">
              <span className="row-region">{q.region}</span>
              <span className="row-meta">
                {timeAgo(q.occurred_at)}, {q.depth_km ?? "?"} km deep
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
