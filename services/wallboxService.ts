export type WallboxSession = {
  reportId: number;
  kWh: number;
  started: Date;
  ended: Date;
  CardId: string;
};

const FIXED_REPORT_ID = 100;
const FIXED_CARD_ID = "ca598b0b00000000";
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
 * Creates a plausible mock wallbox session payload.
 * The upstream timestamp shape uses Unix milliseconds, so the service converts
 * those values immediately into Date instances.
 * @returns A mock wallbox session with recent timestamps and converted kWh.
 */
const createMockWallboxSession = (): WallboxSession => {
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
    reportId: FIXED_REPORT_ID,
    kWh: roundToDecimalPlaces(
      energyWh / WATT_HOURS_PER_KILOWATT_HOUR,
      ENERGY_DECIMAL_PLACES,
    ),
    started: new Date(startedTimestamp),
    ended: new Date(endedTimestamp),
    CardId: FIXED_CARD_ID,
  };
};

/**
 * Returns the current mock wallbox session.
 * @returns The current mock wallbox session payload.
 */
export const getCurrentWallboxSession = async (): Promise<WallboxSession> =>
  createMockWallboxSession();
