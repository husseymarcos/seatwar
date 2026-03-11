export type TeamRivalryCard = {
  teamId: string
  teamName: string
  teamColor: string
  driverA: { shortName: string; winShare: number }
  driverB: { shortName: string; winShare: number }
}
