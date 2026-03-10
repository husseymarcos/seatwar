# SeatWar

A web app where F1 fans can see which driver is winning the rivalry with their teammate. Combines objective race statistics with community sentiment through voting.

## What it does

SeatWar tracks intra-team battles in Formula 1 and shows who is ahead in each pairing. The leaderboard is built from:

1. **Stats (OpenF1 API)** — Race results, qualifying, points, and other performance data from the [OpenF1 API](https://openf1.org/) to compute who is ahead on the track.
2. **Community voting (paid feature)** — Users can vote on who they think is winning the rivalry. Votes are aggregated and combined with stats to reflect both results and fan opinion.

## Tech stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, shadcn/ui, Tailwind CSS
- **Data:** OpenF1 API for race statistics

## Getting started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.