import { z } from "zod"
import {
  openF1,
  type BehaviorOptions,
  type QueryValue,
  type SessionKey,
} from "@/lib/openf1/client"
import { SessionResultRowSchema } from "@/lib/openf1/schemas"

export type SessionResultRow = z.infer<typeof SessionResultRowSchema>

export type GetSessionResultsParams = {
  sessionKey: SessionKey
  positionLte?: number
  positionGte?: number
}

export async function getSessionResults(
  params: GetSessionResultsParams,
  behavior: BehaviorOptions = {}
): Promise<SessionResultRow[]> {
  const { sessionKey, positionLte, positionGte } = params
  const searchParams: Record<string, QueryValue> = {
    session_key: sessionKey,
  }

  if (positionLte !== undefined) searchParams["position<="] = positionLte
  if (positionGte !== undefined) searchParams["position>="] = positionGte

  return openF1.fetch("/session_result", z.array(SessionResultRowSchema), {
    searchParams,
    ...behavior,
    allow404: true,
  })
}
