# T003 — Compute "who's winning" from stats

| Field | Value |
|-------|--------|
| **Status** | todo |
| **Priority** | high |
| **PRD** | §3.1 (Compute "who's winning" from OpenF1 API data) |

## Description

Implement logic that, for a given rivalry and time scope, determines who is ahead for each stat: **points** (championship standings), **race finishes** (head-to-head race results), and **qualifying** (head-to-head qualifying). Output is consumable by both casual (overall) and hardcore (per-stat) views.

## Acceptance criteria

- [ ] “Who’s winning” computed for: points, race finishes, qualifying
- [ ] Logic respects configurable time scope (rolling window: last N races or 12 months)
- [ ] Results are deterministic and testable (e.g. unit tests for sample data)
- [ ] API or module interface allows UI to request overall winner and per-stat winners

## Notes

- PRD §8: exact definition of “overall” winner (e.g. weighted combo vs primary stat) is open; document choice in this ticket or a follow-up.
