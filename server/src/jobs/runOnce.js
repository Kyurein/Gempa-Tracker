// Run with `npm run fetch` to test the BMKG job without starting the server.
import "dotenv/config";
import { initDb, pool } from "../db.js";
import { fetchAndStore } from "./fetchBmkg.js";

await initDb();
await fetchAndStore();
await pool.end();
