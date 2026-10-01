import "dotenv/config";
import express from "express";
import cors from "cors";
import cron from "node-cron";
import { initDb } from "./db.js";
import { fetchAndStore } from "./jobs/fetchBmkg.js";
import earthquakesRouter from "./routes/earthquakes.js";
import authRouter from "./routes/auth.js";
import meRouter from "./routes/me.js";

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing. Add it to your .env file.");
  process.exit(1);
}

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/earthquakes", earthquakesRouter);
app.use("/api/auth", authRouter);
app.use("/api/me", meRouter);

// Lets an outside scheduler (e.g. GitHub Actions) trigger a fetch when a
// free-tier host has been asleep and the cron job didn't run.
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

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server" });
});

const port = process.env.PORT || 4000;

await initDb();
app.listen(port, () => console.log(`API running on http://localhost:${port}`));

// Fetch once at startup, then every 5 minutes.
fetchAndStore();
cron.schedule("*/5 * * * *", fetchAndStore);
