const OPENF1_BASE_URL = "https://api.openf1.org/v1";

type QueryPrimitive = string | number | boolean;
type QueryValue = QueryPrimitive | QueryPrimitive[];

export type OpenF1ErrorCode = "NETWORK" | "HTTP" | "DECODE";

export class OpenF1Error extends Error {
  readonly code: OpenF1ErrorCode;
  readonly status?: number;
  readonly cause?: unknown;

  constructor(message: string, code: OpenF1ErrorCode, status?: number, cause?: unknown) {
    super(message);
    this.name = "OpenF1Error";
    this.code = code;
    this.status = status;
    this.cause = cause;
  }
}

type OpenF1FetchOptions = {
  searchParams?: Record<string, QueryValue>;
  /**
   * Next.js revalidation time in seconds.
   * Defaults to 60 for historical data.
   */
  revalidate?: number;
  /**
   * Number of retry attempts for network errors and 5xx responses.
   * Defaults to 2 (for a total of 3 attempts).
   */
  retries?: number;
};

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function appendSearchParams(url: URL, params: Record<string, QueryValue>) {
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        url.searchParams.append(key, String(item));
      }
    } else if (value !== undefined) {
      url.searchParams.append(key, String(value));
    }
  }
}

async function openF1Fetch<T>(endpoint: string, options: OpenF1FetchOptions = {}): Promise<T> {
  const { searchParams, revalidate = 60, retries = 2 } = options;

  const url = new URL(endpoint, OPENF1_BASE_URL);
  if (searchParams) {
    appendSearchParams(url, searchParams);
  }

  let attempt = 0;

  // Attempt loop: initial try + N retries.
  // Retries are applied to network failures and 5xx responses.
  /* eslint-disable no-constant-condition */
  while (true) {
    try {
      const response = await fetch(url.toString(), {
        // Historical data: safe to cache; revalidation is tunable.
        next: { revalidate },
      });

      if (response.status >= 500 && attempt < retries) {
        attempt += 1;
        await sleep(200 * 2 ** (attempt - 1));
        continue;
      }

      if (!response.ok) {
        const text = await response.text().catch(() => "");

        throw new OpenF1Error(
          `OpenF1 HTTP error ${response.status}`,
          "HTTP",
          response.status,
          text || undefined,
        );
      }

      try {
        return (await response.json()) as T;
      } catch (err) {
        throw new OpenF1Error(
          "Failed to parse OpenF1 response as JSON",
          "DECODE",
          response.status,
          err,
        );
      }
    } catch (err) {
      if (err instanceof OpenF1Error) {
        // For HTTP / DECODE errors we don't retry here.
        throw err;
      }

      if (attempt >= retries) {
        throw new OpenF1Error("Failed to reach OpenF1 API", "NETWORK", undefined, err);
      }

      attempt += 1;
      await sleep(200 * 2 ** (attempt - 1));
    }
  }
  /* eslint-enable no-constant-condition */
}

export type SessionKey = number | "latest";

export interface ChampionshipDriverStanding {
  driver_number: number;
  meeting_key: number;
  points_current: number;
  points_start: number;
  position_current: number;
  position_start: number;
  session_key: number;
}

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

export type GetChampionshipDriversParams = {
  sessionKey?: SessionKey;
  meetingKey?: number | "latest";
  driverNumbers?: number[];
};

export type GetSessionsParams = {
  year?: number;
  sessionType?: string;
  sessionName?: string;
  countryName?: string;
  meetingKey?: number | "latest";
};

export type GetSessionResultsParams = {
  sessionKey: SessionKey;
  positionLte?: number;
  positionGte?: number;
};

type BehaviorOptions = {
  revalidate?: number;
  retries?: number;
};

export async function getChampionshipDrivers(
  params: GetChampionshipDriversParams = {},
  behavior: BehaviorOptions = {},
): Promise<ChampionshipDriverStanding[]> {
  const { sessionKey, meetingKey, driverNumbers } = params;
  const searchParams: Record<string, QueryValue> = {};

  if (sessionKey !== undefined) {
    searchParams.session_key = sessionKey;
  }

  if (meetingKey !== undefined) {
    searchParams.meeting_key = meetingKey;
  }

  if (driverNumbers && driverNumbers.length > 0) {
    searchParams.driver_number = driverNumbers;
  }

  return openF1Fetch<ChampionshipDriverStanding[]>("/championship_drivers", {
    searchParams,
    revalidate: behavior.revalidate,
    retries: behavior.retries,
  });
}

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

export async function getSessionResults(
  params: GetSessionResultsParams,
  behavior: BehaviorOptions = {},
): Promise<SessionResultRow[]> {
  const { sessionKey, positionLte, positionGte } = params;
  const searchParams: Record<string, QueryValue> = {
    session_key: sessionKey,
  };

  if (positionLte !== undefined) {
    // OpenF1 supports operators like position<=3 as query keys.
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

