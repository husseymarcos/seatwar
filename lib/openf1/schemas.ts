import { z } from "zod";

export const SessionSummarySchema = z.object({
  circuit_key: z.number().nullish(),
  circuit_short_name: z.string().nullish(),
  country_code: z.string().nullish(),
  country_key: z.number().nullish(),
  country_name: z.string().nullish(),
  date_end: z.string().nullish(),
  date_start: z.string().catch("").nullish(),
  gmt_offset: z.string().nullish(),
  location: z.string().nullish(),
  meeting_key: z.number().catch(0).nullish(),
  session_key: z.number(),
  session_name: z.string().nullish(),
  session_type: z.string().catch("").nullish(),
  year: z.number().nullish(),
});

export const OpenF1DriverSchema = z.object({
  broadcast_name: z.string().catch("").nullish(),
  country_code: z.string().nullish(),
  driver_number: z.number(),
  first_name: z.string().catch("").nullish(),
  full_name: z.string().catch("").nullish(),
  headshot_url: z.string().catch("").nullish(),
  last_name: z.string().catch("").nullish(),
  meeting_key: z.number().catch(0).nullish(),
  name_acronym: z.string().catch("").nullish(),
  session_key: z.number().catch(0).nullish(),
  team_colour: z.string().catch("71717a").nullish(),
  team_name: z.string().catch("Unknown").nullish(),
});

export const SessionResultRowSchema = z.object({
  dnf: z.boolean().catch(false).nullish(),
  dns: z.boolean().catch(false).nullish(),
  dsq: z.boolean().catch(false).nullish(),
  driver_number: z.number(),
  duration: z.number().nullish(),
  gap_to_leader: z.number().nullish(),
  number_of_laps: z.number().catch(0).nullish(),
  meeting_key: z.number().catch(0).nullish(),
  position: z.number().catch(0).nullish(),
  session_key: z.number().catch(0).nullish(),
});

export const ChampionshipDriverStandingSchema = z.object({
  driver_number: z.number(),
  meeting_key: z.number().catch(0).nullish(),
  points_current: z.number().catch(0).nullish(),
  points_start: z.number().catch(0).nullish(),
  position_current: z.number().catch(0).nullish(),
  position_start: z.number().catch(0).nullish(),
  session_key: z.number().catch(0).nullish(),
});
