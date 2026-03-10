export const OPENF1_BASE_URL = "https://api.openf1.org/v1";

type QueryPrimitive = string | number | boolean;
export type QueryValue = QueryPrimitive | QueryPrimitive[];

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

export type OpenF1FetchOptions = {
  searchParams?: Record<string, QueryValue>;
  revalidate?: number;
  retries?: number;
};

export type BehaviorOptions = {
  revalidate?: number;
  retries?: number;
};

export type SessionKey = number | "latest";

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

export async function openF1Fetch<T>(
  endpoint: string,
  options: OpenF1FetchOptions = {},
): Promise<T> {
  const { searchParams, revalidate = 60, retries = 2 } = options;

  const url = new URL(endpoint, OPENF1_BASE_URL);
  if (searchParams) {
    appendSearchParams(url, searchParams);
  }

  let attempt = 0;

  while (true) {
    try {
      const response = await fetch(url.toString(), {
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
        throw err;
      }

      if (attempt >= retries) {
        throw new OpenF1Error("Failed to reach OpenF1 API", "NETWORK", undefined, err);
      }

      attempt += 1;
      await sleep(200 * 2 ** (attempt - 1));
    }
  }
}
