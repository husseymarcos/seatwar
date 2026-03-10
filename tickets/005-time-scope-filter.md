# T005 — Time scope: rolling window (N races / 12 months)

| Field | Value |
|-------|--------|
| **Status** | todo |
| **Priority** | high |
| **PRD** | §3.1 (Time scope: rolling window — last N races or last 12 months, configurable) |

## Description

Implement a configurable time scope so “who’s winning” and all stats are computed over a rolling window: either **last N races** or **last 12 months**. Expose this as a user-facing filter and wire it through the data/API layer.

## Acceptance criteria

- [ ] User can set time scope: last N races and/or last 12 months (exact options TBD)
- [ ] All stat computations (points, race finishes, qualifying) use the selected scope
- [ ] Default (e.g. last 5 races vs 12 months) is documented and implemented
- [ ] Filter is usable on mobile and desktop

## Notes

- PRD §8: default rolling window is open; decide and document here.
