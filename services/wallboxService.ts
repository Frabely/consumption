import {API_BASE_URL} from "@/constants/api";

export type WallboxSession = {
  reportId: number;
  kWh: number;
  started: Date;
  ended: Date;
  cardId: string;
};

export type WallboxApiStation = "entrance" | "carport";

type WallboxSessionApiResponse = {
  reportId: number;
  kWh: number;
  started: number;
  ended: number;
  CardId: string;
};

const MILLISECONDS_TIMESTAMP_THRESHOLD = 1_000_000_000_000;
const MILLISECONDS_PER_SECOND = 1000;
const WATT_HOURS_PER_KILOWATT_HOUR = 1000;
const WALLBOX_KILOWATT_HOURS_DECIMAL_PLACES = 4;

/**
 * Resolves the future endpoint path for a wallbox station.
 * @param station Requested wallbox station.
 * @returns Endpoint path segment for the station.
 */
export const resolveWallboxSessionEndpoint = (
  station: WallboxApiStation,
): string => `${API_BASE_URL}/sessions/${station}/latest`;

/**
 * Converts a numeric API timestamp to a Date instance.
 * @param timestamp Numeric timestamp in milliseconds or seconds.
 * @returns Converted Date instance.
 */
const convertApiTimestampToDate = (timestamp: number): Date => {
  const normalizedTimestamp =
    timestamp >= MILLISECONDS_TIMESTAMP_THRESHOLD
      ? timestamp
      : timestamp * MILLISECONDS_PER_SECOND;
  return new Date(normalizedTimestamp);
};

/**
 * Rounds a numeric value to the configured amount of decimal places.
 * @param value Numeric value to round.
 * @returns Rounded numeric value.
 */
const roundKilowattHours = (value: number): number =>
  Number(value.toFixed(WALLBOX_KILOWATT_HOURS_DECIMAL_PLACES));

/**
 * Maps the raw wallbox API payload to the internal session model.
 * @param response Raw wallbox API response.
 * @returns Normalized wallbox session with Date values.
 */
const mapWallboxSessionResponse = (
  response: WallboxSessionApiResponse,
): WallboxSession => {
  return {
    reportId: response.reportId,
    kWh: roundKilowattHours(
      response.kWh / WATT_HOURS_PER_KILOWATT_HOUR,
    ),
    started: convertApiTimestampToDate(response.started),
    ended: convertApiTimestampToDate(response.ended),
    cardId: response.CardId,
  };
};

/**
 * Fetches the latest wallbox session from a fully qualified endpoint.
 * @param endpointUrl Fully qualified endpoint URL.
 * @param signal Optional abort signal for request cancellation.
 * @returns Normalized wallbox session payload.
 */
const fetchLatestWallboxSession = async (
  endpointUrl: string,
  signal?: AbortSignal,
): Promise<WallboxSession> => {
  const response = await fetch(endpointUrl, { cache: "no-store", signal });
  if (!response.ok) {
    throw new Error(`Wallbox session request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as WallboxSessionApiResponse;
  return mapWallboxSessionResponse(payload);
};

/**
 * Returns the latest wallbox session for the entrance station.
 * @param signal Optional abort signal for request cancellation.
 * @returns The latest entrance wallbox session payload.
 */
export const getLatestEntranceWallboxSession = async (
  signal?: AbortSignal,
): Promise<WallboxSession> =>
  fetchLatestWallboxSession(resolveWallboxSessionEndpoint("entrance"), signal);

/**
 * Returns the latest wallbox session for the carport station.
 * @param signal Optional abort signal for request cancellation.
 * @returns The latest carport wallbox session payload.
 */
export const getLatestCarportWallboxSession = async (
  signal?: AbortSignal,
): Promise<WallboxSession> =>
  fetchLatestWallboxSession(resolveWallboxSessionEndpoint("carport"), signal);
