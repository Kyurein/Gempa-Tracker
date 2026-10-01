import { pool } from "../db.js";
import { FEEDS, fetchFeed } from "../bmkg.js";

// The same earthquake can appear in more than one feed, so occurred_at is the
// unique key. On conflict we only fill in fields that were missing before.
const UPSERT = `
  INSERT INTO earthquakes
    (occurred_at, magnitude, depth_km, latitude, longitude, region,
     tsunami_potential, felt_in, shakemap_url)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  ON CONFLICT (occurred_at) DO UPDATE SET
    tsunami_potential = COALESCE(EXCLUDED.tsunami_potential, earthquakes.tsunami_potential),
    felt_in           = COALESCE(EXCLUDED.felt_in, earthquakes.felt_in),
    shakemap_url      = COALESCE(EXCLUDED.shakemap_url, earthquakes.shakemap_url)
  RETURNING (xmax = 0) AS inserted
`;

export async function fetchAndStore() {
  let inserted = 0;
  for (const feed of FEEDS) {
    try {
      const quakes = await fetchFeed(feed);
      for (const q of quakes) {
        const { rows } = await pool.query(UPSERT, [
          q.occurred_at, q.magnitude, q.depth_km, q.latitude, q.longitude,
          q.region, q.tsunami_potential, q.felt_in, q.shakemap_url,
        ]);
        if (rows[0]?.inserted) inserted++;
      }
    } catch (err) {
      // One failing feed shouldn't stop the others.
      console.error(`[bmkg] ${err.message}`);
    }
  }
  console.log(`[bmkg] ${new Date().toISOString()} saved ${inserted} new earthquake(s)`);
  return inserted;
}
