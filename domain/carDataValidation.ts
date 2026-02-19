export type KilometerValidationInput = {
  kilometer: string;
  isChangingData: boolean;
  prevKilometers: number;
  currentCarKilometer?: number;
};

/**
 * Parses a string into an integer or returns null when parsing fails.
 * @param value Raw numeric input value.
 * @returns Parsed integer value or null.
 */
export const parseIntegerOrNull = (value: string): number | null => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

/**
 * Validates charged power input against numeric and domain constraints.
 * @param power Raw power string value.
 * @returns True when the power value is valid.
 */
export const isPowerValid = (power: string): boolean => {
  const powerNumber = Number.parseFloat(power);
  return !Number.isNaN(powerNumber) && powerNumber < 99.9 && powerNumber > 0.0;
};

/**
 * Validates kilometer input depending on add/change mode constraints.
 * @param input Kilometer validation context payload.
 * @returns True when kilometer value is valid for the current mode.
 */
export const isKilometerValid = ({
  kilometer,
  isChangingData,
  prevKilometers,
  currentCarKilometer,
}: KilometerValidationInput): boolean => {
  const kilometerNumber = parseIntegerOrNull(kilometer);
  if (kilometerNumber === null) {
    return false;
  }
  if (isChangingData) {
    return kilometerNumber > prevKilometers && kilometerNumber < 1_000_000;
  }
  if (currentCarKilometer === undefined) {
    return false;
  }
  return kilometerNumber > currentCarKilometer && kilometerNumber < 1_000_000;
};
