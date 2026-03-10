# OpenF1 integration & data layer — design

## 1. Goals & scope

- Establish a **typed, reusable data layer** around the OpenF1 API.
- Support the three core stat families from the PRD:
  - Championship **points** (drivers standings).
  - **Race results** (finishing positions per session).
  - **Qualifying results** (grid-like standings per qualifying session).
- Provide **centralised error handling**, **optional retries**, and **basic caching** suitable for a Next.js 16 App Router app.

Out of scope for this ticket:

- Deriving teammate rivalries or computing “who’s winning”.
- UI wiring beyond a minimal usage example if needed.
- Real-time / authenticated OpenF1 access (historical-only for MVP).

## 2. API coverage (MVP)

We will use the following OpenF1 endpoints (all under `https://api.openf1.org/v1`):

- `championship_drivers`
  - Purpose: championship driver standings to back the **points** stat.
  - Key fields: `driver_number`, `points_current`, `points_start`, `position_current`, `position_start`, `session_key`, `meeting_key`.
- `sessions`
  - Purpose: discover sessions and obtain `session_key` / `meeting_key` by year, location, and `session_type` / `session_name` (e.g. `Race`, `Qualifying`).
- `session_result`
  - Purpose: standings after a session to back **race results** and **qualifying** head‑to‑head.
  - Key fields: `driver_number`, `position`, `dnf`, `dns`, `dsq`, `number_of_laps`, `duration`, `gap_to_leader`, `meeting_key`, `session_key`.

Usage / constraints:

- Historical data (2023+) is free and does **not** require auth.
- Real‑time data requires a paid subscription; we **do not** use it in MVP.
- No explicit public rate limits are documented; we will:
  - Use **server‑side caching** (`fetch` revalidation) for commonly used queries.
  - Centralise calls through a single helper to keep future rate‑limit handling easy to add.

## 3. Architecture

### 3.1 Location & shape

- Add `lib/openf1.ts` containing:
  - A generic `openF1Fetch<T>()` helper that:
    - Accepts an endpoint (e.g. `"/session_result"`), query params, and options (revalidate seconds, retries).
    - Builds the full URL, executes `fetch`, and parses JSON.
    - Applies **centralised error handling** and **retry logic**.
    - Uses `next` options for **server‑side caching** (e.g. `revalidate` default of 60s for historical data).
  - **Typed helpers**:
    - `getChampionshipDrivers(...)` → `ChampionshipDriverStanding[]`.
    - `getSessions(...)` → `SessionSummary[]`.
    - `getSessionResults(...)` → `SessionResultRow[]`.

These helpers will be **server‑only** for MVP (called from server components, route handlers, or server actions). If we later need client‑side usage, we can add thin Next.js route handlers that wrap these functions.

### 3.2 Types

Define minimal TypeScript interfaces aligned with our use cases:

- `ChampionshipDriverStanding` with the championship fields described above.
- `SessionSummary` with fields from `sessions` needed to identify and label sessions (e.g. `session_key`, `meeting_key`, `session_type`, `session_name`, `year`, `circuit_short_name`, `country_name`).
- `SessionResultRow` with finishing/standing related fields from `session_result`.

We intentionally **model only the fields we need**; additional fields returned by OpenF1 are ignored but still present at runtime.

### 3.3 Error handling & retries

- Introduce an `OpenF1Error` class that captures:
  - HTTP status (if available).
  - A short machine‑readable code (`"NETWORK" | "HTTP" | "DECODE"`).
  - A human‑oriented message and optional underlying `cause`.
- `openF1Fetch` behaviour:
  - Network errors (thrown by `fetch`) are retried up to `N` times (default 2) with exponential backoff (e.g. 200ms, 400ms).
  - HTTP **5xx** responses are retried with the same policy.
  - HTTP **4xx** responses are **not** retried; they throw an `OpenF1Error` with status and best‑effort error details.
  - JSON parse errors are wrapped in a `"DECODE"` `OpenF1Error`.

### 3.4 Caching strategy

- Historical OpenF1 data is effectively static, so aggressive caching is safe for MVP.
- `openF1Fetch` will:
  - Default to `next: { revalidate: 60 }` (easy to tune later).
  - Allow callers to override `revalidate` (including `0` for “no cache”) via an options argument.
- All helpers (`getChampionshipDrivers`, etc.) simply delegate caching decisions to `openF1Fetch`.

## 4. Alternatives considered

1. **Next.js API route wrappers only**
   - Each OpenF1 endpoint is re‑exposed under `/api/openf1/*`.
   - Pros: stricter separation between external API and frontend; easier to add auth/rate‑limiting later.
   - Cons: more boilerplate; double layer of routing; unnecessary for a server‑rendered MVP.

2. **Class‑based `OpenF1Client` instance**
   - Instantiate a client with configuration (base URL, retries, etc.).
   - Pros: explicit configuration object; easier to stub for tests.
   - Cons: more ceremony; less ergonomic in simple server components.

We choose the **functional helper approach in `lib/openf1.ts`** for its simplicity and alignment with other small `lib/*` utilities. If the integration grows, we can later wrap these helpers in an `OpenF1Client` or add API routes without breaking existing call sites.

## 5. Usage sketch

Example (server component or server utility):

```ts
import { getChampionshipDrivers } from "@/lib/openf1";

const standings = await getChampionshipDrivers({
  sessionKey: "latest",
  driverNumbers: [4, 81],
});
```

Downstream tickets (e.g. “who is winning” logic) will consume these helpers instead of calling OpenF1 directly.

