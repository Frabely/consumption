import type {LoadingStation} from "@/common/models";
import type {WallboxApiStation, WallboxSession} from "@/services/wallboxService";

const ENTRANCE_LOADING_STATION_NAME = "entrance";
const CARPORT_LOADING_STATION_NAME = "carport";
const OFFICIAL_LOADING_STATION_NAME = "official";
const WALLBOX_POWER_DECIMAL_PLACES = 4;

type LoadingSessionRange = {
    started?: Date;
    ended?: Date;
};

/**
 * Returns whether the given loading station supports wallbox prefill.
 * @param loadingStation Loading station to inspect.
 * @returns True when a wallbox session can be fetched for the station.
 */
export const isWallboxPrefillLoadingStation = (
    loadingStation: LoadingStation
): boolean =>
    loadingStation.name === ENTRANCE_LOADING_STATION_NAME ||
    loadingStation.name === CARPORT_LOADING_STATION_NAME;

/**
 * Resolves the wallbox API station slug for a loading station.
 * @param loadingStation Loading station selected in the UI.
 * @returns Wallbox API station slug or undefined when unsupported.
 */
export const resolveWallboxApiStation = (
    loadingStation: LoadingStation | undefined
): WallboxApiStation | undefined => {
    if (!loadingStation) {
        return undefined;
    }
    if (loadingStation.name === ENTRANCE_LOADING_STATION_NAME) {
        return "entrance";
    }
    if (loadingStation.name === CARPORT_LOADING_STATION_NAME) {
        return "carport";
    }
    return undefined;
};

/**
 * Formats a wallbox kWh value for the power input field.
 * @param session Wallbox session payload.
 * @returns Formatted string value for the input field.
 */
export const resolveWallboxPowerPrefill = (session: WallboxSession): string =>
    session.kWh.toFixed(WALLBOX_POWER_DECIMAL_PLACES);

/**
 * Resolves whether wallbox session timestamps can be persisted with the current power input.
 * @param params Current input power, remembered wallbox power and optional timestamps.
 * @returns Existing timestamps when the remembered and current power strings match; otherwise undefined timestamps.
 */
export const resolvePersistedLoadingSessionRange = ({
    rememberedPower,
    currentPower,
    started,
    ended
}: {
    rememberedPower?: string;
    currentPower: string;
    started?: Date;
    ended?: Date;
}): LoadingSessionRange => {
    if (rememberedPower === currentPower) {
        return {started, ended};
    }

    return {
        started: undefined,
        ended: undefined
    };
};

/**
 * Orders loading stations for add-data flows and keeps only the supported choices.
 * @param stations Loading stations currently available in the cache.
 * @returns Ordered loading-station list for the add-data UI.
 */
export const resolveAddDataLoadingStations = (
    stations: LoadingStation[]
): LoadingStation[] => {
    const stationOrder = [
        ENTRANCE_LOADING_STATION_NAME,
        CARPORT_LOADING_STATION_NAME,
        OFFICIAL_LOADING_STATION_NAME
    ];

    return stationOrder
        .map((stationName) => stations.find((station) => station.name === stationName))
        .filter((station): station is LoadingStation => Boolean(station));
};
