import {House, LoadingStation, User} from "@/constants/types";
import {
    DB_BUILDING_CONSUMPTION,
    DB_CARS,
    DB_DATA_FIELDS_KEY,
    DB_DATA_FLATS_KEY,
    DB_DATA_ROOMS_KEY,
    DB_DATA_SET_COLLECTION_KEY,
    DB_FIELD_VALUES,
    DB_FLATS,
    DB_HOUSES,
    DB_LOADING_STATIONS,
    DB_ROOMS,
    DB_USER_COLLECTION_KEY
} from "@/constants/db/collectionKeys";
import {
    cars,
    DEFAULT_CAR,
    houses,
    loadingStations
} from "@/reference-data/cache/referenceDataStore";
import {
    ensureCarsLoaded,
    loadHouses as loadHousesFromReferenceData,
    loadMainPageData
} from "@/reference-data/services/referenceDataLoader";
import type {GetCarsFn} from "@/reference-data/services/referenceDataLoader";

export const DEFAULT_LOADING_STATION: LoadingStation = {
    id: '17498904',
    name: 'carport'
}

export let DEFAULT_HOUSE: House = {
    id: "",
    name: 'F233',
    flats: []
}

export const EMPTY_USER: User = {}
export {
    DB_BUILDING_CONSUMPTION,
    DB_CARS,
    DB_DATA_FIELDS_KEY,
    DB_DATA_FLATS_KEY,
    DB_DATA_ROOMS_KEY,
    DB_DATA_SET_COLLECTION_KEY,
    DB_FIELD_VALUES,
    DB_FLATS,
    DB_HOUSES,
    DB_LOADING_STATIONS,
    DB_ROOMS,
    DB_USER_COLLECTION_KEY
}

/**
 * Compatibility wrapper that keeps existing house-loading call sites stable.
 * @returns Loaded houses array, or an empty array when loading fails.
 */
export const loadHouses = async (): Promise<House[]> => {
    return (await loadHousesFromReferenceData()) ?? [];
};

export {cars, DEFAULT_CAR, ensureCarsLoaded, houses, loadingStations, loadMainPageData};
export type {GetCarsFn};




