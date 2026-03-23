import { LoadingStation, User } from "@/common/models";

export const ENTRANCE_LOADING_STATION_ID = "21819916";

export const DEFAULT_LOADING_STATION: LoadingStation = {
  id: ENTRANCE_LOADING_STATION_ID,
  name: "entrance",
};

/**
 * Resolves the effective default loading-station id for a user.
 * @param user User object that may contain a configured default loading station.
 * @returns Configured loading-station id or the entrance fallback id.
 */
export const resolveDefaultLoadingStationId = (
  user?: Pick<User, "defaultLoadingStationId">,
): string => {
  const configuredLoadingStationId = user?.defaultLoadingStationId?.trim();
  return configuredLoadingStationId || ENTRANCE_LOADING_STATION_ID;
};

/**
 * Resolves a loading-station object from available reference data with entrance fallback.
 * @param params Loading-station id and available station list.
 * @returns Matching loading station or the entrance fallback station.
 */
export const resolveLoadingStationById = ({
  loadingStationId,
  availableLoadingStations,
}: {
  loadingStationId: string;
  availableLoadingStations: LoadingStation[];
}): LoadingStation =>
  availableLoadingStations.find(
    (loadingStation) => loadingStation.id === loadingStationId,
  ) ?? DEFAULT_LOADING_STATION;

/**
 * Resolves the effective default loading station for the current user.
 * @param params User context and available station list.
 * @returns Matching loading station or the entrance fallback station.
 */
export const resolveUserDefaultLoadingStation = ({
  user,
  availableLoadingStations,
}: {
  user?: Pick<User, "defaultLoadingStationId">;
  availableLoadingStations: LoadingStation[];
}): LoadingStation =>
  resolveLoadingStationById({
    loadingStationId: resolveDefaultLoadingStationId(user),
    availableLoadingStations,
  });

/**
 * Normalizes a user object so it always carries an effective default loading-station id.
 * @param user User object to normalize.
 * @returns User object with a guaranteed default loading-station id.
 */
export const withEffectiveDefaultLoadingStation = (user: User): User => ({
  ...user,
  defaultLoadingStationId: resolveDefaultLoadingStationId(user),
});
