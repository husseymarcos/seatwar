import {
  openF1Fetch,
  type BehaviorOptions,
  type QueryValue,
  type SessionKey,
} from "@/lib/openf1/client";

export interface SessionResultRow {
  dnf: boolean;
  dns: boolean;
  dsq: boolean;
  driver_number: number;
  duration: number | null;
  gap_to_leader: number | null;
  number_of_laps: number;
  meeting_key: number;
  position: number;
  session_key: number;
}

export type GetSessionResultsParams = {
  sessionKey: SessionKey;
  positionLte?: number;
  positionGte?: number;
};

export async function getSessionResults(
  params: GetSessionResultsParams,
  behavior: BehaviorOptions = {},
): Promise<SessionResultRow[]> {
  const { sessionKey, positionLte, positionGte } = params;
  const searchParams: Record<string, QueryValue> = {
    session_key: sessionKey,
  };

  if (positionLte !== undefined) {
    searchParams["position<="] = positionLte;
  }

  if (positionGte !== undefined) {
    searchParams["position>="] = positionGte;
  }

  return openF1Fetch<SessionResultRow[]>("/session_result", {
    searchParams,
    revalidate: behavior.revalidate,
    retries: behavior.retries,
  });
}
