# OpenF1 integration — endpoints & usage

This document summarises how SeatWar uses the [OpenF1 API](https://openf1.org/docs/) in the MVP.

## Base configuration

- **Base URL:** `https://api.openf1.org/v1`
- **Auth (MVP):** none required
  - Historical data (from 2023 onwards) is free and accessible without authentication.
  - Real‑time data requires a paid subscription; we **do not** use real‑time endpoints in MVP.
- **Rate limiting:**
  - The public documentation does not state explicit rate limits.
  - Our client:
    - Uses Next.js `fetch` revalidation (default 60s) to cache common queries.
    - Centralises all requests through `lib/openf1/` (client + per-endpoint modules), making it easy to add throttling or backoff policies later.

## Endpoints in use

Integration code lives under `lib/openf1/`: `client.ts` (fetch, errors, retries) and one module per endpoint. Import from the module you need, e.g. `getChampionshipDrivers` from `@/lib/openf1/championship-drivers`, `getDrivers` from `@/lib/openf1/drivers`.

### 1. `championship_drivers`

- **Purpose:** retrieve driver championship standings to support the **points** stat.
- **Example URL:**
  - `GET /championship_drivers?session_key=latest&driver_number=4&driver_number=81`
- **Main fields we rely on:**
  - `driver_number`
  - `meeting_key`
  - `points_current`
  - `points_start`
  - `position_current`
  - `position_start`
  - `session_key`
- **Wrapper:** `getChampionshipDrivers(params, behavior?)`
  - `params.sessionKey?: number | "latest"`
  - `params.meetingKey?: number | "latest"`
  - `params.driverNumbers?: number[]`

### 2. `sessions`

- **Purpose:** discover sessions (race, qualifying, sprint, etc.) and obtain `session_key` / `meeting_key`.
- **Example URL:**
  - `GET /sessions?year=2024&session_type=Race`
  - `GET /sessions?year=2024&session_type=Qualifying`
- **Main fields we rely on:**
  - `circuit_short_name`
  - `country_name`
  - `meeting_key`
  - `session_key`
  - `session_name`
  - `session_type`
  - `year`
- **Wrapper:** `getSessions(params, behavior?)`
  - `params.year?: number`
  - `params.sessionType?: string` (e.g. `"Race"`, `"Qualifying"`)
  - `params.sessionName?: string`
  - `params.countryName?: string`
  - `params.meetingKey?: number | "latest"`

### 3. `drivers`

- **Purpose:** driver roster per session, including **team_name** — used to derive **teammate pairings** (see `lib/teammate-rivalries.ts`).
- **Example URL:**
  - `GET /drivers?session_key=latest` — full grid for latest session
  - `GET /drivers?session_key=9158&driver_number=1` — single driver
- **Main fields we rely on:**
  - `driver_number`, `full_name`, `name_acronym`, `broadcast_name`, `headshot_url`
  - `team_name`, `team_colour`
  - `session_key`, `meeting_key`
- **Wrapper:** `getDrivers(params, behavior?)`
  - `params.sessionKey?: number | "latest"` (default `"latest"`)
  - `params.meetingKey?: number | "latest"`
  - `params.driverNumber?: number`

### 4. `session_result`

- **Purpose:** standings after a session for **race results** and **qualifying** head‑to‑head.
- **Example URL:**
  - `GET /session_result?session_key=7782`
  - `GET /session_result?session_key=7782&position<=3`
- **Main fields we rely on:**
  - `driver_number`
  - `position`
  - `dnf`, `dns`, `dsq`
  - `number_of_laps`
  - `duration`
  - `gap_to_leader`
  - `meeting_key`
  - `session_key`
- **Wrapper:** `getSessionResults(params, behavior?)`
  - `params.sessionKey: number | "latest"`
  - `params.positionLte?: number`
  - `params.positionGte?: number`

## Error handling & retries

All wrappers delegate to a shared `openF1Fetch` helper which:

- Retries **network errors** and **5xx responses** up to `retries` times (default 2, for 3 total attempts) with exponential backoff.
- Throws a typed `OpenF1Error` on:
  - Permanent HTTP errors (4xx / non‑retriable 5xx).
  - JSON decode errors.
  - Exhausted network retries.

This keeps error semantics consistent across all callers and makes it easier to surface failures in the UI.

## Teammate rivalries

Teammate pairings are **not** a dedicated OpenF1 endpoint. They are **derived** by:

1. Calling `getDrivers({ sessionKey: "latest" })` (or a specific `session_key`).
2. Grouping by `team_name` and keeping teams with exactly two drivers.
3. Exposing the result as `TeammateRivalry[]` via `getTeammateRivalries()` / `getCurrentTeammateRivalries()` in `lib/teammate-rivalries.ts`.

Each rivalry includes `driverA` / `driverB` with `driverNumber` so the app can call `getChampionshipDrivers({ sessionKey, driverNumbers })` to compute who is ahead on points.

