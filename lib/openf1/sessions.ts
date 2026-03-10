import { openF1Fetch, type BehaviorOptions, type QueryValue } from "@/lib/openf1/client";

export interface SessionSummary {
  circuit_key: number;
  circuit_short_name: string;
  country_code: string;
  country_key: number;
  country_name: string;
  date_end: string;
  date_start: string;
  gmt_offset: string;
  location: string;
  meeting_key: number;
  session_key: number;
  session_name: string;
  session_type: string;
  year: number;
}

export type GetSessionsParams = {
  year?: number;
  sessionType?: string;
  sessionName?: string;
  countryName?: string;
  meetingKey?: number | "latest";
};

export async function getSessions(
  params: GetSessionsParams = {},
  behavior: BehaviorOptions = {},
): Promise<SessionSummary[]> {
  const { year, sessionType, sessionName, countryName, meetingKey } = params;
  const searchParams: Record<string, QueryValue> = {};

  if (year !== undefined) {
    searchParams.year = year;
  }

  if (sessionType) {
    searchParams.session_type = sessionType;
  }

  if (sessionName) {
    searchParams.session_name = sessionName;
  }

  if (countryName) {
    searchParams.country_name = countryName;
  }

  if (meetingKey !== undefined) {
    searchParams.meeting_key = meetingKey;
  }

  return openF1Fetch<SessionSummary[]>("/sessions", {
    searchParams,
    revalidate: behavior.revalidate,
    retries: behavior.retries,
  });
}
