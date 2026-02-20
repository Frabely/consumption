import {describe, expect, it} from "vitest";
import * as collectionKeys from "@/constants/db/collectionKeys";
import * as legacyConstantData from "@/constants/constantData";

describe("db collection keys", () => {
    it("exports stable keys from the dedicated constants module", () => {
        expect(collectionKeys.DB_CARS).toBe("cars");
        expect(collectionKeys.DB_HOUSES).toBe("houses");
        expect(collectionKeys.DB_DATA_SET_COLLECTION_KEY).toBe("consumptionData");
        expect(collectionKeys.DB_LOADING_STATIONS).toBe("loadingStations");
    });

    it("keeps compatibility exports in constantData", () => {
        expect(legacyConstantData.DB_CARS).toBe(collectionKeys.DB_CARS);
        expect(legacyConstantData.DB_HOUSES).toBe(collectionKeys.DB_HOUSES);
        expect(legacyConstantData.DB_DATA_SET_COLLECTION_KEY).toBe(collectionKeys.DB_DATA_SET_COLLECTION_KEY);
        expect(legacyConstantData.DB_LOADING_STATIONS).toBe(collectionKeys.DB_LOADING_STATIONS);
    });
});
