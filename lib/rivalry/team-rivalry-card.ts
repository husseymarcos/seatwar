export type TeamRivalryCard = {
  teamId: string
  teamName: string
  teamColor: string
  driverA: { shortName: string; winShare: number; driverNumber: number }
  driverB: { shortName: string; winShare: number; driverNumber: number }
  stats: {
    points: { driverA: number; driverB: number }
    raceFinishes: { driverAWins: number; driverBWins: number; ties: number }
    qualifying: { driverAWins: number; driverBWins: number; ties: number }
  }
}
