# SeatWar — Product Requirements Document

**Version:** 1.0  
**Date:** 2025-03-09  

---

## 1. Overview

### 1.1 Product Summary

SeatWar is a web app where F1 fans can see which driver is winning the rivalry with their teammate. It combines objective race statistics with community sentiment (future paid feature) to answer the question: *Who’s ahead in each intra-team battle?*

### 1.2 Target Audience

- **Casual fans:** Want a quick answer — who’s winning the rivalry?
- **Hardcore fans:** Want to explore stats in depth and compare different metrics.

The product serves both with different entry points and depth of information.

---

## 2. Core Value Proposition

- **Stats (always visible):** Race results, qualifying, points, and other performance data from the [OpenF1 API](https://openf1.org/) to compute who is ahead on the track.
- **Community voting (paid, future):** Users vote on who they think is winning. Votes are aggregated and shown as a separate “community says” layer alongside stats.

---

## 3. MVP Scope (Phase 1)

**Stats only.** No voting, no auth, no payments.

### 3.1 In Scope

- Display all current F1 teammate rivalries (e.g. Verstappen vs Hadjar, Hamilton vs Leclerc).
- Compute “who’s winning” from OpenF1 API data.
- **Stat toggles:** User can choose which stat(s) drive the view:
  - Points (championship standings)
  - Race finishes (head-to-head race results)
  - Qualifying (head-to-head qualifying)
- **Time scope:** Rolling window — last N races or last 12 months (configurable).
- **Casual vs hardcore:**
  - **Casual:** Single “overall” winner per rivalry.
  - **Hardcore:** Drill into each stat individually.
- Responsive web app (mobile and desktop).

### 3.2 Out of Scope (MVP)

- User accounts and authentication
- Community voting
- Payments or subscriptions
- Native mobile apps
- PWA / offline support

---

## 4. Future Phases

### 4.1 Phase 2 — Voting (Paid)

- Auth required to vote.
- One vote per rivalry per race/week (can change over time).
- Votes shown as a separate “community says” layer; stats remain always visible.
- Paid feature (monetization TBD).

### 4.2 Phase 3+

- Additional stats, filters, or UX improvements based on usage and feedback.

---

## 5. Technical Context

### 5.1 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, shadcn/ui, Tailwind CSS
- **Data:** OpenF1 API for race statistics

### 5.2 Platform

- Web only (responsive)
- No native apps or PWA in MVP

---

## 6. Success Criteria

**Primary metric:** Engagement — stat toggles used, filters changed, time spent exploring rivalries.

Success means users actively interact with the product rather than passively viewing a single view.

---

## 7. Constraints & Assumptions

- **Constraints:** None specified.
- **Assumptions:**
  - OpenF1 API provides sufficient data for points, race finishes, and qualifying.
  - Teammate pairings can be derived from API data (drivers per team per season/period).
  - Rolling window (N races or 12 months) is technically feasible with OpenF1.

---

## 8. Open Questions

- Exact definition of “overall” winner for casual view (e.g. weighted combo of stats vs. primary stat).
- Default rolling window (e.g. last 5 races vs. last 12 months).
- UI/UX for stat toggles and time filters (placement, defaults, mobile behavior).

---

## Appendix: Decision Log

| Question | Decision |
|----------|----------|
| Primary audience | Both casual and hardcore fans, different entry points |
| Stats vs votes | Stats always visible; votes add separate “community says” layer (paid) |
| Voting mechanics | One vote per rivalry per race/week (can change over time) |
| MVP scope | Stats only |
| Stats that matter | User can toggle (points, race finishes, qualifying) |
| Time scope | Rolling window (last N races or 12 months) |
| Platform | Web only (responsive) |
| Success criteria | Engagement (toggles, filters used) |
| Constraints | None |
| Casual vs hardcore | Casual: single overall winner; hardcore: drill into each stat |
