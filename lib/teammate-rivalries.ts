import type { SessionKey } from "@/lib/openf1/client";
import { getDrivers, type OpenF1Driver } from "@/lib/openf1/drivers";
import { getSessions, latestRaceSessionKey } from "@/lib/openf1/sessions";

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
    fullName: d.full_name ?? "",
    nameAcronym: d.name_acronym ?? "",
    broadcastName: d.broadcast_name ?? "",
    headshotUrl: d.headshot_url ?? "",
  };
}

function buildRivalriesFromDrivers(drivers: OpenF1Driver[]): TeammateRivalry[] {
  const byTeam = new Map<string, OpenF1Driver[]>();

  for (const d of drivers) {
    const key = d.team_name ?? "Unknown";
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
      sessionKey: first.session_key ?? 0,
      meetingKey: first.meeting_key ?? 0,
      driverA: toRivalryDriver(first),
      driverB: toRivalryDriver(second),
    });
  }

  rivalries.sort((a, b) => a.teamName.localeCompare(b.teamName));
  return rivalries;
}

export interface GetTeammateRivalriesResult {
  rivalries: TeammateRivalry[];
  year: number;
}

export async function getTeammateRivalries(
  options: GetTeammateRivalriesOptions = {},
): Promise<GetTeammateRivalriesResult> {
  const { sessionKey = "latest", meetingKey, revalidate, retries } = options;
  const behavior = { revalidate, retries };
  const currentYear = new Date().getFullYear();

  let resolvedSessionKey = sessionKey;
  let resolvedYear = currentYear;

  if (sessionKey === "latest") {
    for (const y of [currentYear, currentYear - 1]) {
      const raceKey = await latestRaceSessionKey(y, behavior);
      if (raceKey) {
        resolvedSessionKey = raceKey;
        resolvedYear = y;
        break;
      }
    }
  }

  let drivers = await getDrivers(
    { sessionKey: resolvedSessionKey, meetingKey },
    behavior,
  );
  let rivalries = buildRivalriesFromDrivers(drivers);

  if (rivalries.length > 0) {
    return { rivalries, year: resolvedYear };
  }

  for (const y of [currentYear, currentYear - 1]) {
    if (y === resolvedYear && sessionKey === "latest") continue;

    const raceKey = await latestRaceSessionKey(y, behavior);
    if (raceKey == null) continue;
    drivers = await getDrivers({ sessionKey: raceKey, meetingKey }, behavior);
    rivalries = buildRivalriesFromDrivers(drivers);
    if (rivalries.length > 0) {
      return { rivalries, year: y };
    }
  }

  return { rivalries: [], year: currentYear };
}

export async function getCurrentTeammateRivalries(
  behavior: Pick<GetTeammateRivalriesOptions, "revalidate" | "retries"> = {},
): Promise<GetTeammateRivalriesResult> {
  return getTeammateRivalries({ sessionKey: "latest", ...behavior });
}
