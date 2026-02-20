import {Car, House} from "@/common/models";
import {getCars, getHouses, getLoadingStations} from "@/firebase/functions";
import {CarNames} from "@/constants/enums";
import {
    cars,
    setCars,
    setDefaultCar,
    setHouses,
    setLoadingStations
} from "@/reference-data/cache/referenceDataStore";

export type GetCarsFn = () => Promise<Car[] | undefined>;
export type GetHousesFn = () => Promise<House[] | undefined>;

/**
 * Ensures that car data is available in the in-memory reference-data cache.
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
        setCars(resultCars);
    }

    return cars;
};

/**
 * Loads main home reference data and synchronizes cache snapshots.
 * @returns Promise resolved after loading stations/cars and default-car snapshot.
 */
export const loadMainPageData = async (): Promise<void> => {
    const resultStations = await getLoadingStations().catch((error: Error) => {
        console.error(error.message);
    });
    if (resultStations) {
        setLoadingStations(resultStations);
    }

    const resultCars = await getCars().catch((error: Error) => {
        console.error(error.message);
    });

    if (!resultCars || resultCars.length === 0) {
        return;
    }

    setCars(resultCars);

    const defaultCarByName = resultCars.find((car) => car.name === CarNames.Zoe);
    setDefaultCar(defaultCarByName ?? resultCars[0]);
};

/**
 * Loads houses from backend and updates the houses cache when available.
 * @param params Optional dependency overrides for fetching houses.
 * @returns Houses result from backend or undefined on failure.
 */
export const loadHouses = async ({
    getHousesFn = getHouses
}: {
    getHousesFn?: GetHousesFn;
} = {}): Promise<House[] | undefined> => {
    const housesResult = await getHousesFn().catch((error: Error) => {
        console.error(error.message);
        return undefined;
    });

    if (housesResult) {
        setHouses(housesResult);
    }

    return housesResult;
};

