export const DACHS_HOUSE_CONFIG = {
    F233: {
        endpointPath: "/dachs/f233/status",
        roomName: "Dachs F233"
    },
    F235: {
        endpointPath: "/dachs/f235/status",
        roomName: "Dachs F235"
    }
} as const;

export type DachsHouseName = keyof typeof DACHS_HOUSE_CONFIG;

/**
 * Checks whether a house name is supported by the Dachs autofill flow.
 * @param houseName House name from the current application context.
 * @returns True when the house name is part of the configured Dachs houses.
 */
export const isSupportedDachsHouseName = (houseName: string): houseName is DachsHouseName =>
    houseName in DACHS_HOUSE_CONFIG;

/**
 * Resolves the configured Dachs room name for a house.
 * @param houseName House name from the current application context.
 * @returns The target room name or undefined when the house is not supported.
 */
export const getDachsTargetRoomName = (houseName: string): string | undefined =>
    isSupportedDachsHouseName(houseName) ? DACHS_HOUSE_CONFIG[houseName].roomName : undefined;
