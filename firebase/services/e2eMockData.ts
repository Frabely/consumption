import {Role} from "@/constants/enums";
import {Car, LoadingStation, User} from "@/constants/types";

const E2E_MOCK_STORAGE_KEY = "consumption.e2e.mock-data";

export const E2E_MOCK_CARS: Car[] = [
    {name: "Zoe", kilometer: 12000, prevKilometer: 11900},
    {name: "BMW", kilometer: 45000, prevKilometer: 44900}
];

export const E2E_MOCK_LOADING_STATIONS: LoadingStation[] = [
    {id: "station-1", name: "carport"},
    {id: "station-2", name: "frontDoor"}
];

/**
 * Resolves whether e2e mock data mode is active.
 * @returns True when mock data should be returned in services.
 */
export const isE2EMockModeEnabled = (): boolean => {
    if (process.env.NEXT_PUBLIC_E2E_MOCK_DATA === "1") {
        return true;
    }

    if (typeof window !== "undefined") {
        return window.localStorage.getItem(E2E_MOCK_STORAGE_KEY) === "1";
    }

    return false;
};

/**
 * Creates a deterministic e2e mock user for session validation flows.
 * @param userId Requested user id.
 * @returns Mock user object for e2e execution.
 */
export const createE2EMockUser = (userId: string): User => ({
    key: userId,
    name: "Playwright User",
    role: Role.Admin,
    defaultCar: "Zoe"
});
