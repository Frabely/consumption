import {Car, House, LoadingStation, User} from "@/constants/types";
import {getCars, getHouses, getLoadingStations} from "@/firebase/functions";
import {CarNames} from "@/constants/enums";
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

export const DEFAULT_LOADING_STATION: LoadingStation = {
    id: '17498904',
    name: 'carport'
}

export let DEFAULT_CAR: Car;

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

export let loadingStations: LoadingStation[] = []
export let cars: Car[] = []
export let houses: House[] = []

export type GetCarsFn = () => Promise<Car[] | undefined>;

/**
 * Ensures that car data is available in the in-memory cache.
 * @param params Optional dependency overrides for fetching cars.
 * @returns Cached car entries after the load attempt.
 */
export const ensureCarsLoaded = async ({
    getCarsFn = getCars
}: {
    getCarsFn?: GetCarsFn;
} = {}): Promise<Car[]> => {
    if (cars.length > 0) {
        return cars;
    }

    const resultCars = await getCarsFn().catch((error: Error) => {
        console.error(error.message);
        return undefined;
    });

    if (resultCars) {
        cars = resultCars;
    }

    return cars;
};

export const loadMainPageData = async () => {
    const resultStations = await getLoadingStations().catch((error: Error) => {
        console.error(error.message)
    })
    if (resultStations)
        loadingStations = resultStations

    const resultCars = await getCars().catch((error: Error) => {
        console.error(error.message)
    })
    if (resultCars) {
        cars = resultCars
        if (cars.length > 0) {
            cars.map((car) => {
                if (car.name === CarNames.Zoe)
                    DEFAULT_CAR = {
                        name: car.name,
                        kilometer: car.kilometer,
                        prevKilometer: car.prevKilometer,
                    }
            })
            if (!DEFAULT_CAR)
            DEFAULT_CAR = {
                name: cars[0].name,
                kilometer: cars[0].kilometer,
                prevKilometer: cars[0].prevKilometer,
            }
        }
    }
}

export const loadHouses = async () => {
    return getHouses().then((housesResult) => {
        return housesResult
    })
}




