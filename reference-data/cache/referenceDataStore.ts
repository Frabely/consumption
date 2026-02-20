import {Car, House, LoadingStation} from "@/constants/types";

export let DEFAULT_CAR: Car | undefined;

export const loadingStations: LoadingStation[] = [];
export const cars: Car[] = [];
export const houses: House[] = [];

/**
 * Replaces cached loading stations with the latest immutable snapshot.
 * @param nextStations Latest stations resolved from data source.
 * @returns No return value.
 */
export const setLoadingStations = (nextStations: LoadingStation[]): void => {
    loadingStations.splice(0, loadingStations.length, ...nextStations);
};

/**
 * Replaces cached cars with the latest immutable snapshot.
 * @param nextCars Latest cars resolved from data source.
 * @returns No return value.
 */
export const setCars = (nextCars: Car[]): void => {
    cars.splice(0, cars.length, ...nextCars);
};

/**
 * Replaces cached houses with the latest immutable snapshot.
 * @param nextHouses Latest houses resolved from data source.
 * @returns No return value.
 */
export const setHouses = (nextHouses: House[]): void => {
    houses.splice(0, houses.length, ...nextHouses);
};

/**
 * Updates cached default car snapshot.
 * @param nextDefaultCar Next default car or undefined.
 * @returns No return value.
 */
export const setDefaultCar = (nextDefaultCar: Car | undefined): void => {
    DEFAULT_CAR = nextDefaultCar;
};

/**
 * Clears mutable reference-data cache for deterministic tests.
 * @returns No return value.
 */
export const resetReferenceDataStore = (): void => {
    setCars([]);
    setHouses([]);
    setLoadingStations([]);
    setDefaultCar(undefined);
};
