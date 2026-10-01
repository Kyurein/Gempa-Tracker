import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function validate(email, password) {
  if (!EMAIL_RE.test(email || "")) return "Enter a valid email address";
  if (typeof password !== "string" || password.length < 8) {
    return "Password must be at least 8 characters";
  }
  return null;
}

router.post("/register", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const { password } = req.body;
    const problem = validate(email, password);
    if (problem) return res.status(400).json({ error: problem });

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash) VALUES ($1, $2)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email`,
      [email, hash]
    );
    if (!rows[0]) return res.status(409).json({ error: "An account with this email already exists" });
    res.status(201).json({ token: signToken(rows[0].id), user: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const { password } = req.body;
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = rows[0];
    // Same message for both cases so attackers can't tell which emails exist.
    if (!user || !(await bcrypt.compare(String(password || ""), user.password_hash))) {
      return res.status(401).json({ error: "Email or password is incorrect" });
    }
    res.json({ token: signToken(user.id), user: { id: user.id, email: user.email } });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT id, email FROM users WHERE id = $1", [req.userId]);
    rows[0] ? res.json(rows[0]) : res.status(404).json({ error: "Account not found" });
  } catch (err) {
    next(err);
  }
});

export default router;
