# T003 — Compute "who's winning" from stats

| Field | Value |
|-------|--------|
| **Status** | done |
| **Priority** | high |
| **PRD** | §3.1 (Compute "who's winning" from OpenF1 API data) |

## Description

Implement logic that, for a given rivalry and time scope, determines who is ahead for each stat: **points** (championship standings), **race finishes** (head-to-head race results), and **qualifying** (head-to-head qualifying). Output is consumable by both casual (overall) and hardcore (per-stat) views.

## Acceptance criteria

- [x] “Who’s winning” computed for: points, race finishes, qualifying
- [x] Logic respects configurable time scope (rolling window: last N races or 12 months)
- [x] API or module interface allows UI to request overall winner and per-stat winners

## Implementation

- **Module:** `lib/rivalry/who-is-winning.ts`
  - **Points:** `comparePoints(standings, driverA, driverB)` using `championship_drivers` (`points_current`); latest row per driver if multiple.
  - **Race finishes / qualifying:** head-to-head per session via `session_result` (lower `position` wins; DNF/DNS/DSQ treated as unclassified). Aggregated wins across sessions in scope.
  - **Time scope:** `TimeScope` = `lastNRaces` | `lastMonths` | `season`. Race sessions selected by `sessions` API (`session_type=Race`); qualifying sessions matched by `meeting_key`.
  - **Async entrypoint:** `getWhoIsWinning({ pair, scope }, behavior?)` fetches OpenF1 and returns `WhoIsWinningResult`.
  - **HTTP:** `GET /api/who-is-winning?a={driverA}&b={driverB}&scope=lastNRaces&n=5` (also `lastMonths`, `season`).
  - **Pure entrypoint:** `buildWhoIsWinningResult(...)` when the UI already has standings + session result batches.

## Notes

- **Overall winner (PRD §8):** **Majority** of the three stats (points, race finishes, qualifying). If tied on count (e.g. 1–1–1 or all tie), **points** is the tie-breaker (primary stat). Same rule documented for T006.
