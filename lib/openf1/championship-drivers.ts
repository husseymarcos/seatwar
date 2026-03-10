import {
  openF1Fetch,
  type BehaviorOptions,
  type QueryValue,
  type SessionKey,
} from "@/lib/openf1/client";

export interface ChampionshipDriverStanding {
  driver_number: number;
  meeting_key: number;
  points_current: number;
  points_start: number;
  position_current: number;
  position_start: number;
  session_key: number;
}

export type GetChampionshipDriversParams = {
  sessionKey?: SessionKey;
  meetingKey?: number | "latest";
  driverNumbers?: number[];
};

export async function getChampionshipDrivers(
  params: GetChampionshipDriversParams = {},
  behavior: BehaviorOptions = {},
): Promise<ChampionshipDriverStanding[]> {
  const { sessionKey, meetingKey, driverNumbers } = params;
  const searchParams: Record<string, QueryValue> = {};

  if (sessionKey !== undefined) {
    searchParams.session_key = sessionKey;
  }

  if (meetingKey !== undefined) {
    searchParams.meeting_key = meetingKey;
  }

  if (driverNumbers && driverNumbers.length > 0) {
    searchParams.driver_number = driverNumbers;
  }

  return openF1Fetch<ChampionshipDriverStanding[]>("/championship_drivers", {
    searchParams,
    revalidate: behavior.revalidate,
    retries: behavior.retries,
  });
}
