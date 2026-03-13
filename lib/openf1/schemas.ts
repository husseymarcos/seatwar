import { z } from "zod";

export const SessionSummarySchema = z.object({
  circuit_key: z.number(),
  circuit_short_name: z.string(),
  country_code: z.string(),
  country_key: z.number(),
  country_name: z.string(),
  date_end: z.string(),
  date_start: z.string(),
  gmt_offset: z.string(),
  location: z.string(),
  meeting_key: z.number(),
  session_key: z.number(),
  session_name: z.string(),
  session_type: z.string(),
  year: z.number(),
});

export const OpenF1DriverSchema = z.object({
  broadcast_name: z.string(),
  country_code: z.string().nullable().optional(),
  driver_number: z.number(),
  first_name: z.string(),
  full_name: z.string(),
  headshot_url: z.string(),
  last_name: z.string(),
  meeting_key: z.number(),
  name_acronym: z.string(),
  session_key: z.number(),
  team_colour: z.string(),
  team_name: z.string(),
});

export const SessionResultRowSchema = z.object({
  dnf: z.boolean().default(false),
  dns: z.boolean().default(false),
  dsq: z.boolean().default(false),
  driver_number: z.number(),
  duration: z.number().nullable(),
  gap_to_leader: z.number().nullable(),
  number_of_laps: z.number(),
  meeting_key: z.number(),
  position: z.number(),
  session_key: z.number(),
});

export const ChampionshipDriverStandingSchema = z.object({
  driver_number: z.number(),
  meeting_key: z.number(),
  points_current: z.number(),
  points_start: z.number(),
  position_current: z.number(),
  position_start: z.number(),
  session_key: z.number(),
});
