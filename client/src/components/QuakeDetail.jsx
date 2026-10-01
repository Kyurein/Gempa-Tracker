import { magColor, formatWib } from "../quake.js";

export default function QuakeDetail({ quake, onBack }) {
  return (
    <article className="detail">
      <button className="back" onClick={onBack}>Back to list</button>
      <div className="detail-head">
        <span className="detail-mag" style={{ color: magColor(quake.magnitude) }}>
          {quake.magnitude.toFixed(1)}
        </span>
        <h2>{quake.region}</h2>
      </div>
      <dl>
        <dt>Time</dt>
        <dd>{formatWib(quake.occurred_at)}</dd>
        <dt>Depth</dt>
        <dd>{quake.depth_km ?? "Unknown"} km</dd>
        <dt>Location</dt>
        <dd>{quake.latitude.toFixed(2)}, {quake.longitude.toFixed(2)}</dd>
        {quake.tsunami_potential && (<><dt>Tsunami</dt><dd>{quake.tsunami_potential}</dd></>)}
        {quake.felt_in && (<><dt>Felt in</dt><dd>{quake.felt_in}</dd></>)}
      </dl>
      {quake.shakemap_url && (
        <img className="shakemap" src={quake.shakemap_url} alt={`BMKG shakemap for the earthquake in ${quake.region}`} />
      )}
    </article>
  );
}
