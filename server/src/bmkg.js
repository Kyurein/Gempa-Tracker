// Fetches and parses BMKG's open earthquake feeds.
// Source: https://data.bmkg.go.id/gempabumi (credit BMKG in your app).

const BASE = "https://data.bmkg.go.id/DataMKG/TEWS/";

export const FEEDS = ["autogempa.json", "gempaterkini.json", "gempadirasakan.json"];

// BMKG sends everything as strings, e.g. Coordinates "-7.05,107.98", Kedalaman "10 km".
export function parseQuake(g) {
  const [latitude, longitude] = String(g.Coordinates ?? "").split(",").map(Number);
  const quake = {
    occurred_at: g.DateTime,
    magnitude: parseFloat(g.Magnitude),
    depth_km: parseInt(g.Kedalaman, 10) || null,
    latitude,
    longitude,
    region: g.Wilayah ?? null,
    tsunami_potential: g.Potensi || null,
    felt_in: g.Dirasakan || null,
    shakemap_url: g.Shakemap ? BASE + g.Shakemap : null,
  };
  const valid =
    quake.occurred_at &&
    Number.isFinite(quake.magnitude) &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);
  return valid ? quake : null;
}

// autogempa.json has a single object; the other feeds have an array.
export function extractQuakes(json) {
  const raw = json?.Infogempa?.gempa;
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map(parseQuake).filter(Boolean);
}

export async function fetchFeed(name) {
  const res = await fetch(BASE + name, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  return extractQuakes(await res.json());
}
