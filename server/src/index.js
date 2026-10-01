// Local development entry point. On Vercel, api/index.js is used instead.
import cron from "node-cron";
import app from "./app.js";
import { initDb } from "./db.js";
import { fetchAndStore } from "./jobs/fetchBmkg.js";

const port = process.env.PORT || 4000;

await initDb();
app.listen(port, () => console.log(`API running on http://localhost:${port}`));

// Fetch once at startup, then every 5 minutes.
fetchAndStore();
cron.schedule("*/5 * * * *", fetchAndStore);
