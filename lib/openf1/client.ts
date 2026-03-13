import { z } from "zod";

export const OPENF1_BASE_URL = "https://api.openf1.org/v1";

export type OpenF1ErrorCode = "NETWORK" | "HTTP" | "DECODE" | "VALIDATION";

export class OpenF1Error extends Error {
  constructor(
    message: string,
    public readonly code: OpenF1ErrorCode,
    public readonly status?: number,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "OpenF1Error";
  }
}

type QueryPrimitive = string | number | boolean;
export type QueryValue = QueryPrimitive | QueryPrimitive[];

export type FetchOptions = {
  searchParams?: Record<string, QueryValue>;
  revalidate?: number;
  retries?: number;
};

export type BehaviorOptions = Pick<FetchOptions, "revalidate" | "retries">;

export type SessionKey = number | "latest";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class OpenF1Client {
  private readonly baseUrl: string;

  constructor(baseUrl: string = OPENF1_BASE_URL) {
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  }

  private buildUrl(endpoint: string, params?: Record<string, QueryValue>): URL {
    const path = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
    const url = new URL(path, this.baseUrl);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (Array.isArray(value)) {
          value.forEach((v) => url.searchParams.append(key, String(v)));
        } else if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      }
    }

    return url;
  }

  async fetch<T>(
    endpoint: string,
    schema: z.ZodType<T>,
    options: FetchOptions = {},
  ): Promise<T> {
    const { searchParams, revalidate = 60, retries = 2 } = options;
    const url = this.buildUrl(endpoint, searchParams);

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url.toString(), {
          next: { revalidate },
        });

        if (!response.ok) {
          if (response.status >= 500 && attempt < retries) {
            await sleep(200 * Math.pow(2, attempt));
            continue;
          }

          const errorBody = await response.text().catch(() => "");
          throw new OpenF1Error(
            `OpenF1 HTTP error ${response.status}`,
            "HTTP",
            response.status,
            errorBody || undefined,
          );
        }

        const json = await response.json().catch((err) => {
          throw new OpenF1Error(
            "Failed to parse OpenF1 response as JSON",
            "DECODE",
            response.status,
            err,
          );
        });

        const validation = schema.safeParse(json);
        if (!validation.success) {
          throw new OpenF1Error(
            "OpenF1 response failed validation",
            "VALIDATION",
            response.status,
            validation.error,
          );
        }

        return validation.data;
      } catch (err) {
        if (err instanceof OpenF1Error) throw err;

        if (attempt === retries) {
          throw new OpenF1Error("Failed to reach OpenF1 API", "NETWORK", undefined, err);
        }

        await sleep(200 * Math.pow(2, attempt));
      }
    }

    throw new OpenF1Error("Unexpected error in OpenF1 fetch", "NETWORK");
  }
}

export const openF1 = new OpenF1Client();

export async function openF1Fetch<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { searchParams, revalidate = 60, retries = 2 } = options;
  const client = new OpenF1Client();
  return client.fetch(endpoint, z.any() as z.ZodType<T>, {
    searchParams,
    revalidate,
    retries,
  });
}
