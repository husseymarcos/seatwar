import {
  openF1Fetch,
  type BehaviorOptions,
  type QueryValue,
  type SessionKey,
} from "@/lib/openf1/client";

export interface OpenF1Driver {
  broadcast_name: string;
  country_code?: string | null;
  driver_number: number;
  first_name: string;
  full_name: string;
  headshot_url: string;
  last_name: string;
  meeting_key: number;
  name_acronym: string;
  session_key: number;
  team_colour: string;
  team_name: string;
}

export type GetDriversParams = {
  sessionKey?: SessionKey;
  meetingKey?: number | "latest";
  driverNumber?: number;
};

export async function getDrivers(
  params: GetDriversParams = {},
  behavior: BehaviorOptions = {},
): Promise<OpenF1Driver[]> {
  const { sessionKey = "latest", meetingKey, driverNumber } = params;
  const searchParams: Record<string, QueryValue> = {
    session_key: sessionKey,
  };

  if (meetingKey !== undefined) {
    searchParams.meeting_key = meetingKey;
  }

  if (driverNumber !== undefined) {
    searchParams.driver_number = driverNumber;
  }

  return openF1Fetch<OpenF1Driver[]>("/drivers", {
    searchParams,
    revalidate: behavior.revalidate,
    retries: behavior.retries,
  });
}
