import type { SessionKey } from "@/lib/openf1/client";
import { getDrivers, type OpenF1Driver } from "@/lib/openf1/drivers";
import { getSessions } from "@/lib/openf1/sessions";

export interface RivalryDriver {
  driverNumber: number;
  fullName: string;
  nameAcronym: string;
  broadcastName: string;
  headshotUrl: string;
}

export interface TeammateRivalry {
  id: string;
  teamName: string;
  teamColour: string;
  sessionKey: number;
  meetingKey: number;
  driverA: RivalryDriver;
  driverB: RivalryDriver;
}

export type GetTeammateRivalriesOptions = {
  sessionKey?: SessionKey;
  meetingKey?: number | "latest";
  revalidate?: number;
  retries?: number;
};

function toRivalryDriver(d: OpenF1Driver): RivalryDriver {
  return {
    driverNumber: d.driver_number,
    fullName: d.full_name,
    nameAcronym: d.name_acronym,
    broadcastName: d.broadcast_name,
    headshotUrl: d.headshot_url,
  };
}

function buildRivalriesFromDrivers(drivers: OpenF1Driver[]): TeammateRivalry[] {
  const byTeam = new Map<string, OpenF1Driver[]>();

  for (const d of drivers) {
    const key = d.team_name;
    const list = byTeam.get(key);
    if (list) list.push(d);
    else byTeam.set(key, [d]);
  }

  const rivalries: TeammateRivalry[] = [];

  for (const [teamName, teamDrivers] of byTeam) {
    const unique = new Map<number, OpenF1Driver>();
    for (const d of teamDrivers) {
      unique.set(d.driver_number, d);
    }
    const roster = Array.from(unique.values()).sort(
      (a, b) => a.driver_number - b.driver_number,
    );

    if (roster.length < 2) continue;

    const first = roster[0];
    const second = roster[1];
    const teamColour = first.team_colour || "#71717a";

    rivalries.push({
      id: `${teamName}-${first.driver_number}-${second.driver_number}`,
      teamName,
      teamColour,
      sessionKey: first.session_key,
      meetingKey: first.meeting_key,
      driverA: toRivalryDriver(first),
      driverB: toRivalryDriver(second),
    });
  }

  rivalries.sort((a, b) => a.teamName.localeCompare(b.teamName));
  return rivalries;
}

function parseDateStart(iso: string): number {
  return new Date(iso).getTime();
}

async function latestRaceSessionKey(
  year: number,
  behavior: { revalidate?: number; retries?: number },
): Promise<number | null> {
  const sessions = await getSessions({ year, sessionType: "Race" }, behavior);
  if (sessions.length === 0) return null;
  const sorted = [...sessions].sort(
    (a, b) => parseDateStart(a.date_start) - parseDateStart(b.date_start),
  );
  const last = sorted[sorted.length - 1];
  return last?.session_key ?? null;
}

export async function getTeammateRivalries(
  options: GetTeammateRivalriesOptions = {},
): Promise<TeammateRivalry[]> {
  const { sessionKey = "latest", meetingKey, revalidate, retries } = options;
  const behavior = { revalidate, retries };

  let drivers = await getDrivers({ sessionKey, meetingKey }, behavior);

  let rivalries = buildRivalriesFromDrivers(drivers);

  if (rivalries.length === 0) {
    const year = new Date().getFullYear();
    for (const y of [year, year - 1]) {
      const raceKey = await latestRaceSessionKey(y, behavior);
      if (raceKey == null) continue;
      drivers = await getDrivers({ sessionKey: raceKey, meetingKey }, behavior);
      rivalries = buildRivalriesFromDrivers(drivers);
      if (rivalries.length > 0) break;
    }
  }

  return rivalries;
}

export async function getCurrentTeammateRivalries(
  behavior: Pick<GetTeammateRivalriesOptions, "revalidate" | "retries"> = {},
): Promise<TeammateRivalry[]> {
  return getTeammateRivalries({ sessionKey: "latest", ...behavior });
}
