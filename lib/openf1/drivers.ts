import { z } from "zod";
import { openF1, type BehaviorOptions, type QueryValue, type SessionKey } from "@/lib/openf1/client";
import { OpenF1DriverSchema } from "@/lib/openf1/schemas";

export type OpenF1Driver = z.infer<typeof OpenF1DriverSchema>;

export type GetDriversParams = {
  sessionKey?: SessionKey;
  meetingKey?: number | "latest";
  driverNumber?: number;
};

export async function getDrivers(
  params: GetDriversParams = {},
  behavior: BehaviorOptions = {},
): Promise<OpenF1Driver[]> {
  const { sessionKey = "latest", meetingKey, driverNumber } = params;

  const searchParams: Record<string, QueryValue> = {
    session_key: sessionKey,
  };

  if (meetingKey !== undefined) searchParams.meeting_key = meetingKey;
  if (driverNumber !== undefined) searchParams.driver_number = driverNumber;

  return openF1.fetch("/drivers", z.array(OpenF1DriverSchema), {
    searchParams,
    ...behavior,
  });
}
