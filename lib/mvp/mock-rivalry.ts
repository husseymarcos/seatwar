/**
 * MVP mock data — only winShare percentages are mocked.
 * Driver names / team colors are static placeholders until OpenF1 + assets land.
 */

export type TeamRivalryCard = {
  teamId: string
  teamName: string
  teamColor: string
  driverA: { shortName: string; winShare: number }
  driverB: { shortName: string; winShare: number }
}

/** winShare for A and B should sum to 100 (mock only) */
export const MOCK_TEAM_RIVALRIES: TeamRivalryCard[] = [
  {
    teamId: "mclaren",
    teamName: "McLaren",
    teamColor: "#FF8700",
    driverA: { shortName: "Norris", winShare: 58 },
    driverB: { shortName: "Piastri", winShare: 42 },
  },
  {
    teamId: "ferrari",
    teamName: "Ferrari",
    teamColor: "#E8002D",
    driverA: { shortName: "Leclerc", winShare: 51 },
    driverB: { shortName: "Hamilton", winShare: 49 },
  },
  {
    teamId: "redbull",
    teamName: "Red Bull Racing",
    teamColor: "#3671C6",
    driverA: { shortName: "Verstappen", winShare: 72 },
    driverB: { shortName: "Tsunoda", winShare: 28 },
  },
  {
    teamId: "mercedes",
    teamName: "Mercedes",
    teamColor: "#27F4D2",
    driverA: { shortName: "Russell", winShare: 54 },
    driverB: { shortName: "Antonelli", winShare: 46 },
  },
  {
    teamId: "aston",
    teamName: "Aston Martin",
    teamColor: "#229971",
    driverA: { shortName: "Alonso", winShare: 61 },
    driverB: { shortName: "Stroll", winShare: 39 },
  },
  {
    teamId: "alpine",
    teamName: "Alpine",
    teamColor: "#FF87BC",
    driverA: { shortName: "Gasly", winShare: 55 },
    driverB: { shortName: "Doohan", winShare: 45 },
  },
  {
    teamId: "haas",
    teamName: "Haas",
    teamColor: "#B6BABD",
    driverA: { shortName: "Ocon", winShare: 48 },
    driverB: { shortName: "Bearman", winShare: 52 },
  },
  {
    teamId: "racingbulls",
    teamName: "Racing Bulls",
    teamColor: "#6692FF",
    driverA: { shortName: "Lawson", winShare: 44 },
    driverB: { shortName: "Hadjar", winShare: 56 },
  },
  {
    teamId: "williams",
    teamName: "Williams",
    teamColor: "#64C4FF",
    driverA: { shortName: "Albon", winShare: 57 },
    driverB: { shortName: "Sainz", winShare: 43 },
  },
  {
    teamId: "sauber",
    teamName: "Kick Sauber",
    teamColor: "#52E252",
    driverA: { shortName: "Hülkenberg", winShare: 49 },
    driverB: { shortName: "Bortoleto", winShare: 51 },
  },
  // 11th slot — grid expands to 11 in 2026; placeholder pairing until entries are fixed
  {
    teamId: "cadillac",
    teamName: "Cadillac",
    teamColor: "#9B8CEB",
    driverA: { shortName: "TBA", winShare: 50 },
    driverB: { shortName: "TBA", winShare: 50 },
  },
]
