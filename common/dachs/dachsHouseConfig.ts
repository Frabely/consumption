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

export type DachsRoomName = (typeof DACHS_HOUSE_CONFIG)[DachsHouseName]["roomName"];

/**
 * Checks whether a room name is supported by the Dachs autofill flow.
 * @param roomName Room name from the current application context.
 * @returns True when the room name is part of the configured Dachs rooms.
 */
export const isSupportedDachsRoomName = (roomName: string): roomName is DachsRoomName =>
    Object.values(DACHS_HOUSE_CONFIG).some((config) => config.roomName === roomName);

/**
 * Resolves the configured Dachs house name for a room name.
 * @param roomName Room name from the current application context.
 * @returns The house name or undefined when the room is not supported.
 */
export const getDachsHouseNameByRoomName = (roomName: string): DachsHouseName | undefined =>
    (Object.entries(DACHS_HOUSE_CONFIG) as Array<[DachsHouseName, (typeof DACHS_HOUSE_CONFIG)[DachsHouseName]]>)
        .find(([, config]) => config.roomName === roomName)?.[0];
