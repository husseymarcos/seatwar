import { z } from "zod"
import {
  openF1,
  type BehaviorOptions,
  type QueryValue,
} from "@/lib/openf1/client"
import { SessionSummarySchema } from "@/lib/openf1/schemas"

export type SessionSummary = z.infer<typeof SessionSummarySchema>

export type GetSessionsParams = {
  year?: number
  dateStart?: string
  dateEnd?: string
  sessionKey?: number
  sessionKeyGt?: number
  sessionType?: string
  sessionName?: string
  countryName?: string
  meetingKey?: number | "latest"
}

export async function getSessions(
  params: GetSessionsParams = {},
  behavior: BehaviorOptions = {}
): Promise<SessionSummary[]> {
  const {
    year,
    dateStart,
    dateEnd,
    sessionKey,
    sessionKeyGt,
    sessionType,
    sessionName,
    countryName,
    meetingKey,
  } = params

  const searchParams: Record<string, QueryValue> = {}
  if (year !== undefined) searchParams.year = year
  if (dateStart !== undefined) searchParams["date_start>"] = dateStart
  if (dateEnd !== undefined) searchParams["date_end<"] = dateEnd
  if (sessionKey !== undefined) searchParams.session_key = sessionKey
  if (sessionKeyGt !== undefined) searchParams["session_key>"] = sessionKeyGt
  if (sessionType) searchParams.session_type = sessionType
  if (sessionName) searchParams.session_name = sessionName
  if (countryName) searchParams.country_name = countryName
  if (meetingKey !== undefined) searchParams.meeting_key = meetingKey

  return openF1.fetch("/sessions", z.array(SessionSummarySchema), {
    searchParams,
    ...behavior,
  })
}
