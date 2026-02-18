import {describe, expect, it, vi} from "vitest";
import {ModalState} from "@/constants/enums";
import {DataSet} from "@/constants/types";
import {
    loadDataSetForCar,
    mapDataSetToListItems,
    shouldLoadDataSet,
    syncKilometer
} from "@/components/Display/Display.logic";
import {setDataSetArray} from "@/store/reducer/currentDataSet";
import {setIsLoading} from "@/store/reducer/isLoading";
import {setKilometer} from "@/store/reducer/modal/kilometer";

describe("Display domain", () => {
    const dataSet: DataSet[] = [
        {
            id: "1",
            kilometer: 100,
            power: 20,
            name: "A",
            date: new Date("2026-01-01T00:00:00.000Z"),
            loadingStation: {id: "ls-1", name: "carport"}
        },
        {
            id: "2",
            kilometer: 200,
            power: 30,
            name: "B",
            date: new Date("2026-01-02T00:00:00.000Z"),
            loadingStation: {id: "ls-2", name: "official"}
        }
    ];

    it("loads data only when modal is none and a car name exists", () => {
        expect(shouldLoadDataSet(ModalState.None, "Zoe")).toBe(true);
        expect(shouldLoadDataSet(ModalState.None, "")).toBe(false);
        expect(shouldLoadDataSet(ModalState.AddCarData, "Zoe")).toBe(false);
    });

    it("maps list items with alternating style and first-element flag", () => {
        const result = mapDataSetToListItems(dataSet);

        expect(result[0].isLight).toBe(true);
        expect(result[0].isFirstElement).toBe(true);
        expect(result[1].isLight).toBe(false);
        expect(result[1].isFirstElement).toBe(false);
    });

    it("syncs kilometer only when a value is present", () => {
        const dispatch = vi.fn();

        syncKilometer(1234, dispatch);
        syncKilometer(undefined, dispatch);

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith(setKilometer("1234"));
    });

    it("loads and dispatches data set successfully", async () => {
        const dispatch = vi.fn();
        const getFullDataSetFn = vi.fn().mockResolvedValue(dataSet);

        await loadDataSetForCar({carName: "Zoe", dispatch, getFullDataSetFn});

        expect(dispatch).toHaveBeenNthCalledWith(1, setIsLoading(true));
        expect(dispatch).toHaveBeenNthCalledWith(2, setDataSetArray(dataSet));
        expect(dispatch).toHaveBeenNthCalledWith(3, setIsLoading(false));
    });

    it("dispatches empty list when no data set is returned", async () => {
        const dispatch = vi.fn();
        const getFullDataSetFn = vi.fn().mockResolvedValue(undefined);

        await loadDataSetForCar({carName: "Zoe", dispatch, getFullDataSetFn});

        expect(dispatch).toHaveBeenNthCalledWith(1, setIsLoading(true));
        expect(dispatch).toHaveBeenNthCalledWith(2, setDataSetArray([]));
        expect(dispatch).toHaveBeenNthCalledWith(3, setIsLoading(false));
    });
});
