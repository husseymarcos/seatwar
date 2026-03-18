import type { TeamRivalryCard } from "@/lib/rivalry/team-rivalry-card"
import type { TeammateRivalry } from "@/lib/teammate-rivalries"
import {
  getWhoIsWinning,
  winSharesFromWhoIsWinning,
  type TimeScope,
} from "@/lib/rivalry/who-is-winning"
import type { BehaviorOptions } from "@/lib/openf1/client"

export async function buildTeamRivalryCardsFromOpenF1(
  rivalries: TeammateRivalry[],
  scope: TimeScope,
  behavior: BehaviorOptions = {},
): Promise<TeamRivalryCard[]> {
  const settled = await Promise.allSettled(
    rivalries.map(async (r) => {
      const who = await getWhoIsWinning(
        {
          pair: {
            driverNumberA: r.driverA.driverNumber,
            driverNumberB: r.driverB.driverNumber,
          },
          scope,
        },
        behavior,
      )
      const shares = winSharesFromWhoIsWinning(who)
      return { r, shares, who }
    }),
  )

  const cards: TeamRivalryCard[] = []
  for (let i = 0; i < settled.length; i++) {
    const outcome = settled[i]
    if (outcome.status !== "fulfilled") continue
    const { r, shares, who } = outcome.value
    cards.push({
      teamId: r.id,
      teamName: r.teamName,
      teamColor:
        r.teamColour && /^[0-9A-Fa-f]{6}$/.test(r.teamColour)
          ? `#${r.teamColour}`
          : r.teamColour || "#71717a",
      driverA: {
        shortName: r.driverA.nameAcronym || r.driverA.broadcastName,
        winShare: shares.driverA,
        driverNumber: r.driverA.driverNumber,
      },
      driverB: {
        shortName: r.driverB.nameAcronym || r.driverB.broadcastName,
        winShare: shares.driverB,
        driverNumber: r.driverB.driverNumber,
      },
      stats: {
        points: {
          driverA: who.breakdown?.points.driverA ?? 0,
          driverB: who.breakdown?.points.driverB ?? 0,
        },
        raceFinishes: {
          driverAWins: who.breakdown?.raceFinishes.driverAWins ?? 0,
          driverBWins: who.breakdown?.raceFinishes.driverBWins ?? 0,
          ties: who.breakdown?.raceFinishes.ties ?? 0,
        },
        qualifying: {
          driverAWins: who.breakdown?.qualifying.driverAWins ?? 0,
          driverBWins: who.breakdown?.qualifying.driverBWins ?? 0,
          ties: who.breakdown?.qualifying.ties ?? 0,
        },
      },
    })
  }

  return cards
}
