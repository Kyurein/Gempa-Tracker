import pg from "pg";
import { SCHEMA_SQL } from "./schema.js";

// Postgres NUMERIC comes back as a string by default; return magnitude as a number.
pg.types.setTypeParser(pg.types.builtins.NUMERIC, parseFloat);

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase requires SSL; local Postgres usually doesn't.
  ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false },
  // On Vercel each function instance is short-lived, so keep one connection per instance.
  max: process.env.VERCEL ? 1 : 10,
});

// Creates the tables if they don't exist yet. Runs once per server start
// (or once per serverless instance on Vercel).
let initPromise;
export function initDb() {
  initPromise ??= pool.query(SCHEMA_SQL).catch((err) => {
    initPromise = undefined; // let the next request try again
    throw err;
  });
  return initPromise;
}
