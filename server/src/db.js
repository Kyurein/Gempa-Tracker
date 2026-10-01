import pg from "pg";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Postgres NUMERIC comes back as a string by default; return magnitude as a number.
pg.types.setTypeParser(pg.types.builtins.NUMERIC, parseFloat);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase and Neon require SSL; local Postgres usually doesn't.
  ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false },
});

// Creates the tables if they don't exist yet, so setup is one less step.
export async function initDb() {
  const sql = await fs.readFile(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(sql);
}
