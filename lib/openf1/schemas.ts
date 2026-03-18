import { z } from "zod"

export const SessionSummarySchema = z.object({
  circuit_key: z.coerce.number().nullish(),
  circuit_short_name: z.string().nullish(),
  country_code: z.string().nullish(),
  country_key: z.coerce.number().nullish(),
  country_name: z.string().nullish(),
  date_end: z.string().nullish(),
  date_start: z.string().catch("").nullish(),
  gmt_offset: z.string().nullish(),
  location: z.string().nullish(),
  meeting_key: z.coerce.number().catch(0).nullish(),
  session_key: z.coerce.number(),
  session_name: z.string().nullish(),
  session_type: z.string().catch("").nullish(),
  year: z.coerce.number().nullish(),
})

export const OpenF1DriverSchema = z.object({
  broadcast_name: z.string().catch("").nullish(),
  country_code: z.string().nullish(),
  driver_number: z.coerce.number(),
  first_name: z.string().catch("").nullish(),
  full_name: z.string().catch("").nullish(),
  headshot_url: z.string().catch("").nullish(),
  last_name: z.string().catch("").nullish(),
  meeting_key: z.coerce.number().catch(0).nullish(),
  name_acronym: z.string().catch("").nullish(),
  session_key: z.coerce.number().catch(0).nullish(),
  team_colour: z.string().catch("71717a").nullish(),
  team_name: z.string().catch("Unknown").nullish(),
})

export const SessionResultRowSchema = z.object({
  dnf: z
    .boolean()
    .or(z.string().transform((v) => v === "true"))
    .catch(false)
    .nullish(),
  dns: z
    .boolean()
    .or(z.string().transform((v) => v === "true"))
    .catch(false)
    .nullish(),
  dsq: z
    .boolean()
    .or(z.string().transform((v) => v === "true"))
    .catch(false)
    .nullish(),
  driver_number: z.coerce.number(),
  duration: z.union([z.number(), z.string(), z.array(z.any())]).nullish(),
  gap_to_leader: z.union([z.number(), z.string(), z.array(z.any())]).nullish(),
  number_of_laps: z.coerce.number().catch(0).nullish(),
  meeting_key: z.coerce.number().catch(0).nullish(),
  position: z.coerce.number().catch(0).nullish(),
  session_key: z.coerce.number().catch(0).nullish(),
})

export const ChampionshipDriverStandingSchema = z.object({
  driver_number: z.coerce.number(),
  meeting_key: z.coerce.number().catch(0).nullish(),
  points_current: z.coerce.number().catch(0).nullish(),
  points_start: z.coerce.number().catch(0).nullish(),
  position_current: z.coerce.number().catch(0).nullish(),
  position_start: z.coerce.number().catch(0).nullish(),
  session_key: z.coerce.number().catch(0).nullish(),
})
