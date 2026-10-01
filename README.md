# Gempa Tracker

A fullstack web app that tracks earthquakes in Indonesia. The backend pulls BMKG's open earthquake feeds every 5 minutes and stores each new earthquake in PostgreSQL, building a history that goes beyond the 15 most recent events BMKG publishes. The frontend shows them on an interactive map with a filterable list and a detail view.

**Live demo:** _add your link here_

![Screenshot](docs/screenshot.png)

## Features

- Scheduled job that fetches three BMKG feeds and saves new earthquakes, skipping duplicates
- Map of Indonesia with earthquakes sized and colored by magnitude
- List filtered by minimum magnitude, with relative times
- Detail view with depth, coordinates, tsunami potential, felt reports, and the BMKG shakemap
- Accounts with register and login (bcrypt-hashed passwords, JWT tokens)
- "My places": users save places like home or campus with an alert radius, shown as circles on the map
- A list of earthquakes near each saved place, using the haversine distance formula
- REST API with input validation and clear error messages

## Tech stack

- **Frontend:** React, Vite, React-Leaflet
- **Backend:** Node.js, Express, node-cron
- **Database:** PostgreSQL (Supabase or Neon)
- **Deployment:** Vercel (frontend), Render or Railway (backend)

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/earthquakes?minMag=&days=&limit=` | Filtered list, newest first |
| GET | `/api/earthquakes/latest` | Most recent earthquake |
| GET | `/api/earthquakes/:id` | One earthquake |
| POST | `/api/refresh` | Trigger a BMKG fetch (needs `x-refresh-secret` header) |
| POST | `/api/auth/register` | Create an account, returns a token |
| POST | `/api/auth/login` | Log in, returns a token |
| GET | `/api/auth/me` | Current user (needs token) |
| GET / POST | `/api/me/locations` | List or add saved places (needs token) |
| DELETE | `/api/me/locations/:id` | Remove a saved place (needs token) |
| GET | `/api/me/nearby?days=30` | Earthquakes near saved places (needs token) |
| GET | `/api/health` | Health check |

## Running locally

You need Node.js 18+ and a PostgreSQL database (a free Supabase or Neon project works).

```bash
# Backend
cd server
cp .env.example .env      # then fill in DATABASE_URL and JWT_SECRET
npm install
npm run dev               # creates the tables and starts fetching from BMKG

# Frontend (in a second terminal)
cd client
cp .env.example .env
npm install
npm run dev               # open http://localhost:5173
```

Run `npm run fetch` inside `server/` to test the BMKG job on its own.

## How it works

BMKG returns all values as strings (for example, coordinates as `"-7.05,107.98"` and depth as `"10 km"`), so the backend parses them into numbers before saving. The same earthquake often appears in more than one feed, so `occurred_at` is a unique column and inserts use `ON CONFLICT` to fill in missing fields instead of creating duplicates.

Passwords are hashed with bcrypt before saving, and login returns a JWT that the frontend sends in the `Authorization` header. Protected queries always filter by the user id from the token, so users can only see or delete their own places.

To find earthquakes near a saved place, the backend calculates the great-circle distance with the haversine formula and keeps earthquakes inside that place's radius.

## Future improvements

- Email or push notifications when an earthquake hits near a saved place
- Statistics dashboard (earthquakes per week, most active regions)
- Tests for the parser and API routes

## Data source

Earthquake data from [BMKG](https://data.bmkg.go.id/gempabumi) (Badan Meteorologi, Klimatologi, dan Geofisika).
