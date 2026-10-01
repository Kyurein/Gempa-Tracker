import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// GET /api/earthquakes?minMag=4&days=30&limit=200
router.get("/", async (req, res, next) => {
  try {
    const minMag = Number(req.query.minMag) || 0;
    const days = Math.min(Number(req.query.days) || 3650, 3650);
    const limit = Math.min(Number(req.query.limit) || 200, 1000);
    const { rows } = await pool.query(
      `SELECT * FROM earthquakes
       WHERE magnitude >= $1 AND occurred_at >= now() - make_interval(days => $2)
       ORDER BY occurred_at DESC
       LIMIT $3`,
      [minMag, days, limit]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/latest", async (_req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM earthquakes ORDER BY occurred_at DESC LIMIT 1");
    rows[0] ? res.json(rows[0]) : res.status(404).json({ error: "No earthquakes saved yet" });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "id must be a number" });
    const { rows } = await pool.query("SELECT * FROM earthquakes WHERE id = $1", [id]);
    rows[0] ? res.json(rows[0]) : res.status(404).json({ error: "Earthquake not found" });
  } catch (err) {
    next(err);
  }
});

export default router;
