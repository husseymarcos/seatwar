import { z } from "zod";
import { openF1, type BehaviorOptions, type QueryValue } from "@/lib/openf1/client";
import { SessionSummarySchema } from "@/lib/openf1/schemas";

export type SessionSummary = z.infer<typeof SessionSummarySchema>;

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
  if (year !== undefined) searchParams.year = year;
  if (sessionType) searchParams.session_type = sessionType;
  if (sessionName) searchParams.session_name = sessionName;
  if (countryName) searchParams.country_name = countryName;
  if (meetingKey !== undefined) searchParams.meeting_key = meetingKey;

  return openF1.fetch("/sessions", z.array(SessionSummarySchema), {
    searchParams,
    ...behavior,
  });
}

export async function latestRaceSessionKey(
  year: number,
  behavior: BehaviorOptions = {},
): Promise<number | null> {
  const sessions = await getSessions({ year, sessionType: "Race" }, behavior);
  if (sessions.length === 0) return null;
  const sorted = [...sessions].sort(
    (a, b) =>
      new Date(a.date_start ?? "").getTime() -
      new Date(b.date_start ?? "").getTime(),
  );
  return sorted[sorted.length - 1].session_key;
}
