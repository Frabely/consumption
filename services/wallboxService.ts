export type WallboxSession = {
  reportId: number;
  kWh: number;
  started: Date;
  ended: Date;
  CardId: string;
};

export type WallboxApiStation = "entrance" | "carport";

const STATION_REPORT_IDS: Record<WallboxApiStation, number> = {
  entrance: 200,
  carport: 100,
};
const STATION_CARD_IDS: Record<WallboxApiStation, string> = {
  entrance: "entrance0000000000",
  carport: "ca598b0b00000000",
};
const MIN_END_OFFSET_MINUTES = 2;
const MAX_END_OFFSET_MINUTES = 15;
const MIN_CHARGING_DURATION_MINUTES = 20;
const MAX_CHARGING_DURATION_MINUTES = 480;
const MIN_CHARGING_POWER_KW = 2.3;
const MAX_CHARGING_POWER_KW = 11;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;
const WATT_HOURS_PER_KILOWATT_HOUR = 1000;
const ENERGY_DECIMAL_PLACES = 2;

/**
 * Returns a random integer within the inclusive range.
 * @param min The minimum allowed integer.
 * @param max The maximum allowed integer.
 * @returns A random integer between min and max.
 */
const getRandomIntegerInRange = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Returns a random decimal within the inclusive range.
 * @param min The minimum allowed value.
 * @param max The maximum allowed value.
 * @returns A random number between min and max.
 */
const getRandomNumberInRange = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

/**
 * Converts minutes to milliseconds.
 * @param minutes The amount of minutes to convert.
 * @returns The converted duration in milliseconds.
 */
const minutesToMilliseconds = (minutes: number): number =>
  minutes * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND;

/**
 * Rounds a numeric value to a fixed amount of decimal places.
 * @param value The number to round.
 * @param decimalPlaces The number of decimal places to keep.
 * @returns The rounded number.
 */
const roundToDecimalPlaces = (value: number, decimalPlaces: number): number => {
  const factor = 10 ** decimalPlaces;
  return Math.round(value * factor) / factor;
};

/**
 * Resolves the future endpoint path for a wallbox station.
 * @param station Requested wallbox station.
 * @returns Endpoint path segment for the station.
 */
export const resolveWallboxSessionEndpoint = (
  station: WallboxApiStation,
): string => `/api/v1/sessions/${station}/latest`;

/**
 * Creates a plausible mock wallbox session payload for one station.
 * @param station Requested wallbox station.
 * @returns A mock wallbox session with recent timestamps and converted kWh.
 */
const createMockWallboxSession = (station: WallboxApiStation): WallboxSession => {
  const endOffsetMinutes = getRandomIntegerInRange(
    MIN_END_OFFSET_MINUTES,
    MAX_END_OFFSET_MINUTES,
  );
  const chargingDurationMinutes = getRandomIntegerInRange(
    MIN_CHARGING_DURATION_MINUTES,
    MAX_CHARGING_DURATION_MINUTES,
  );
  const chargingPowerKw = getRandomNumberInRange(
    MIN_CHARGING_POWER_KW,
    MAX_CHARGING_POWER_KW,
  );

  const endedTimestamp = Date.now() - minutesToMilliseconds(endOffsetMinutes);
  const startedTimestamp =
    endedTimestamp - minutesToMilliseconds(chargingDurationMinutes);
  const chargingDurationHours = chargingDurationMinutes / MINUTES_PER_HOUR;
  const energyWh =
    chargingDurationHours * chargingPowerKw * WATT_HOURS_PER_KILOWATT_HOUR;

  return {
    reportId: STATION_REPORT_IDS[station],
    kWh: roundToDecimalPlaces(
      energyWh / WATT_HOURS_PER_KILOWATT_HOUR,
      ENERGY_DECIMAL_PLACES,
    ),
    started: new Date(startedTimestamp),
    ended: new Date(endedTimestamp),
    CardId: STATION_CARD_IDS[station],
  };
};

/**
 * Returns the latest wallbox session for the requested station.
 * @param station Requested wallbox station.
 * @returns The latest wallbox session payload.
 */
export const getLatestWallboxSession = async (
  station: WallboxApiStation,
): Promise<WallboxSession> => {
  resolveWallboxSessionEndpoint(station);
  return createMockWallboxSession(station);
};
