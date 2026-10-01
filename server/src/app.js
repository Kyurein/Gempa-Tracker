import "dotenv/config";
import express from "express";
import cors from "cors";
import { initDb } from "./db.js";
import { fetchAndStore } from "./jobs/fetchBmkg.js";
import earthquakesRouter from "./routes/earthquakes.js";
import authRouter from "./routes/auth.js";
import meRouter from "./routes/me.js";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing. Add it to your environment variables.");
}

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

// Make sure the tables exist before handling any request.
app.use(async (_req, _res, next) => {
  try {
    await initDb();
    next();
  } catch (err) {
    next(err);
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/earthquakes", earthquakesRouter);
app.use("/api/auth", authRouter);
app.use("/api/me", meRouter);

// Triggers a BMKG fetch. Called every 10 minutes by the GitHub Actions
// workflow in production, since serverless hosts can't run cron jobs.
app.post("/api/refresh", async (req, res, next) => {
  try {
    if (req.get("x-refresh-secret") !== process.env.REFRESH_SECRET) {
      return res.status(401).json({ error: "Invalid refresh secret" });
    }
    res.json({ inserted: await fetchAndStore() });
  } catch (err) {
    next(err);
  }
});

app.use((_req, res) => res.status(404).json({ error: "Not found" }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server" });
});

export default app;
