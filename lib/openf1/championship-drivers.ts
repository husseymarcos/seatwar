import { z } from "zod"
import {
  openF1,
  type BehaviorOptions,
  type QueryValue,
  type SessionKey,
} from "@/lib/openf1/client"
import { ChampionshipDriverStandingSchema } from "@/lib/openf1/schemas"

export type ChampionshipDriverStanding = z.infer<
  typeof ChampionshipDriverStandingSchema
>

export type GetChampionshipDriversParams = {
  sessionKey?: SessionKey
  meetingKey?: number | "latest"
  driverNumbers?: number[]
}

export async function getChampionshipDrivers(
  params: GetChampionshipDriversParams = {},
  behavior: BehaviorOptions = {}
): Promise<ChampionshipDriverStanding[]> {
  const { sessionKey, meetingKey, driverNumbers } = params
  const searchParams: Record<string, QueryValue> = {}

  if (sessionKey !== undefined) searchParams.session_key = sessionKey
  if (meetingKey !== undefined) searchParams.meeting_key = meetingKey
  if (driverNumbers && driverNumbers.length > 0)
    searchParams.driver_number = driverNumbers

  return openF1.fetch(
    "/championship_drivers",
    z.array(ChampionshipDriverStandingSchema),
    {
      searchParams,
      ...behavior,
      allow404: true,
    }
  )
}
