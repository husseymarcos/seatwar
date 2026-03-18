import { z } from "zod"

export const OPENF1_BASE_URL = "https://api.openf1.org/v1"

export type OpenF1ErrorCode = "NETWORK" | "HTTP" | "DECODE" | "VALIDATION"

export class OpenF1Error extends Error {
  constructor(
    message: string,
    public readonly code: OpenF1ErrorCode,
    public readonly status?: number,
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = "OpenF1Error"
  }
}

type QueryPrimitive = string | number | boolean
export type QueryValue = QueryPrimitive | QueryPrimitive[]

export type FetchOptions = {
  searchParams?: Record<string, QueryValue>
  revalidate?: number
  retries?: number
  /**
   * If true, 404 responses will return null instead of throwing.
   * Use this for endpoints where 404 means "data not available yet"
   * rather than an error condition.
   */
  allow404?: boolean
}

export type BehaviorOptions = Pick<FetchOptions, "revalidate" | "retries">

export type SessionKey = number | "latest"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Throttles parallel requests by adding a delay between each request start.
 * This prevents flooding the API with too many simultaneous requests.
 */
export async function throttleAll<T>(
  items: T[],
  fn: (item: T, index: number) => Promise<unknown>,
  delayMs: number = 100
): Promise<unknown[]> {
  const results: unknown[] = []
  for (let i = 0; i < items.length; i++) {
    if (i > 0) {
      await sleep(delayMs)
    }
    results.push(await fn(items[i], i))
  }
  return results
}

export class OpenF1Client {
  private readonly baseUrl: string

  constructor(baseUrl: string = OPENF1_BASE_URL) {
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`
  }

  private buildUrl(endpoint: string, params?: Record<string, QueryValue>): URL {
    const path = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint
    const url = new URL(path, this.baseUrl)

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (Array.isArray(value)) {
          value.forEach((v) => url.searchParams.append(key, String(v)))
        } else if (value !== undefined) {
          url.searchParams.append(key, String(value))
        }
      }
    }

    return url
  }

  async fetch<T>(
    endpoint: string,
    schema: z.ZodType<T>,
    options: FetchOptions = {}
  ): Promise<T> {
    const { searchParams, revalidate = 60, retries = 2 } = options
    const url = this.buildUrl(endpoint, searchParams)

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(
          `OpenF1 Request: ${url.toString()} (attempt ${attempt + 1})`
        )
        const response = await fetch(url.toString(), {
          next: { revalidate },
        })

        console.log(
          `OpenF1 Response: ${response.status} ${response.statusText}`
        )

        if (!response.ok) {
          // Handle 404 gracefully if allow404 is set
          if (response.status === 404 && options.allow404) {
            console.log(`OpenF1 404 for ${url.toString()}, returning empty`)
            return [] as T
          }

          const isRetryable = response.status >= 500 || response.status === 429
          if (isRetryable && attempt < retries) {
            const delay = 1000 * Math.pow(2, attempt)
            console.log(
              `OpenF1 rate limit (429) or server error (${response.status}), retrying in ${delay}ms...`
            )
            await sleep(delay)
            continue
          }

          const errorBody = await response.text().catch(() => "")
          throw new OpenF1Error(
            `OpenF1 HTTP error ${response.status}`,
            "HTTP",
            response.status,
            errorBody || undefined
          )
        }

        const json = await response.json().catch((err) => {
          throw new OpenF1Error(
            "Failed to parse OpenF1 response as JSON",
            "DECODE",
            response.status,
            err
          )
        })

        const validation = schema.safeParse(json)
        if (!validation.success) {
          console.error("OpenF1 Validation Error for:", url.toString())
          console.error(
            "Issues:",
            JSON.stringify(validation.error.issues, null, 2)
          )
          console.error(
            "Raw Data (first item):",
            JSON.stringify(Array.isArray(json) ? json[0] : json, null, 2)
          )
          throw new OpenF1Error(
            "OpenF1 response failed validation",
            "VALIDATION",
            response.status,
            validation.error
          )
        }

        return validation.data
      } catch (err) {
        if (err instanceof OpenF1Error) throw err

        if (attempt === retries) {
          console.error("OpenF1 Network Error:", err)
          throw new OpenF1Error(
            "Failed to reach OpenF1 API",
            "NETWORK",
            undefined,
            err
          )
        }

        await sleep(200 * Math.pow(2, attempt))
      }
    }

    throw new OpenF1Error("Unexpected error in OpenF1 fetch", "NETWORK")
  }
}

export const openF1 = new OpenF1Client()

export async function openF1Fetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { searchParams, revalidate = 60, retries = 2 } = options
  const client = new OpenF1Client()
  return client.fetch(endpoint, z.any() as z.ZodType<T>, {
    searchParams,
    revalidate,
    retries,
  })
}
