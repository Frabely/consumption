export type KilometerValidationInput = {
    kilometer: string;
    isChangingData: boolean;
    prevKilometers: number;
    currentCarKilometer?: number;
};

export const parseIntegerOrNull = (value: string): number | null => {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
};

export const isPowerValid = (power: string): boolean => {
    const powerNumber = Number.parseFloat(power);
    return !Number.isNaN(powerNumber) && powerNumber < 99.9 && powerNumber > 0.0;
};

export const isKilometerValid = ({
    kilometer,
    isChangingData,
    prevKilometers,
    currentCarKilometer
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
