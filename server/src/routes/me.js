import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { haversineKm } from "../utils/haversine.js";

const router = Router();
router.use(requireAuth);

const MAX_LOCATIONS = 10;

router.get("/locations", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM watched_locations WHERE user_id = $1 ORDER BY created_at",
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post("/locations", async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const latitude = Number(req.body.latitude);
    const longitude = Number(req.body.longitude);
    const radius_km = Math.round(Number(req.body.radius_km));

    if (!name || name.length > 50) return res.status(400).json({ error: "Name must be 1 to 50 characters" });
    if (!(latitude >= -90 && latitude <= 90)) return res.status(400).json({ error: "Latitude must be between -90 and 90" });
    if (!(longitude >= -180 && longitude <= 180)) return res.status(400).json({ error: "Longitude must be between -180 and 180" });
    if (!(radius_km >= 10 && radius_km <= 1000)) return res.status(400).json({ error: "Radius must be between 10 and 1000 km" });

    const { rows: countRows } = await pool.query(
      "SELECT count(*)::int AS n FROM watched_locations WHERE user_id = $1",
      [req.userId]
    );
    if (countRows[0].n >= MAX_LOCATIONS) {
      return res.status(400).json({ error: `You can save up to ${MAX_LOCATIONS} places` });
    }

    const { rows } = await pool.query(
      `INSERT INTO watched_locations (user_id, name, latitude, longitude, radius_km)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.userId, name, latitude, longitude, radius_km]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/locations/:id", async (req, res, next) => {
  try {
    // user_id in the WHERE clause stops users from deleting each other's places.
    const { rowCount } = await pool.query(
      "DELETE FROM watched_locations WHERE id = $1 AND user_id = $2",
      [Number(req.params.id), req.userId]
    );
    rowCount ? res.status(204).end() : res.status(404).json({ error: "Place not found" });
  } catch (err) {
    next(err);
  }
});

// GET /api/me/nearby?days=30
// Earthquakes within the radius of any of the user's saved places.
router.get("/nearby", async (req, res, next) => {
  try {
    const days = Math.min(Number(req.query.days) || 30, 365);
    const [{ rows: places }, { rows: quakes }] = await Promise.all([
      pool.query("SELECT * FROM watched_locations WHERE user_id = $1", [req.userId]),
      pool.query(
        `SELECT * FROM earthquakes
         WHERE occurred_at >= now() - make_interval(days => $1)
         ORDER BY occurred_at DESC LIMIT 2000`,
        [days]
      ),
    ]);

    const nearby = [];
    for (const q of quakes) {
      let closest = null;
      for (const p of places) {
        const d = haversineKm(p.latitude, p.longitude, q.latitude, q.longitude);
        if (d <= p.radius_km && (!closest || d < closest.distance_km)) {
          closest = { place_name: p.name, distance_km: Math.round(d) };
        }
      }
      if (closest) nearby.push({ ...q, ...closest });
    }
    res.json(nearby);
  } catch (err) {
    next(err);
  }
});

export default router;
