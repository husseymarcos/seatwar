# T008 — Display all current F1 teammate rivalries

| Field | Value |
|-------|--------|
| **Status** | todo |
| **Priority** | high |
| **PRD** | §3.1 (Display all current F1 teammate rivalries) |

## Description

Build the main UI that lists all current F1 teammate rivalries (e.g. cards or rows). Each item should show the two drivers and, depending on implementation order, either the overall winner (casual) or placeholders that will be wired to T003/T006. Integrate with stat toggles and time scope once those exist.

## Acceptance criteria

- [ ] All current rivalries are displayed (data from T002)
- [ ] Each rivalry is clearly labeled (team and/or driver names)
- [ ] “Who’s winning” (overall or per-stat) is shown once backend/logic is ready
- [ ] List is the primary landing view and works with filters/toggles

## Notes

- Can start with static or mock data, then connect to OpenF1 and “who’s winning” logic.
