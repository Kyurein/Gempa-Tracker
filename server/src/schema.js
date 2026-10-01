// Tables are created automatically on first run (see initDb in db.js).
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS earthquakes (
  id                SERIAL PRIMARY KEY,
  occurred_at       TIMESTAMPTZ NOT NULL UNIQUE,
  magnitude         NUMERIC(3,1) NOT NULL,
  depth_km          INTEGER,
  latitude          DOUBLE PRECISION NOT NULL,
  longitude         DOUBLE PRECISION NOT NULL,
  region            TEXT,
  tsunami_potential TEXT,
  felt_in           TEXT,
  shakemap_url      TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_earthquakes_occurred_at ON earthquakes (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_earthquakes_magnitude ON earthquakes (magnitude);

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS watched_locations (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  latitude   DOUBLE PRECISION NOT NULL,
  longitude  DOUBLE PRECISION NOT NULL,
  radius_km  INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_watched_locations_user ON watched_locations (user_id);
`;
