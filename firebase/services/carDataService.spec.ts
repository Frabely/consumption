import {beforeEach, describe, expect, it, vi} from "vitest";

const firestoreMocks = vi.hoisted(() => ({
    addDoc: vi.fn(),
    collection: vi.fn(),
    doc: vi.fn(),
    getDocs: vi.fn(),
    orderBy: vi.fn(),
    query: vi.fn(),
    updateDoc: vi.fn()
}));

vi.mock("@firebase/firestore", () => firestoreMocks);
vi.mock("firebase/firestore", () => ({
    Timestamp: {
        fromDate: vi.fn((date: Date) => ({toDate: () => date}))
    }
}));
vi.mock("@/firebase/db", () => ({db: {}}));
vi.mock("@/firebase/services/loadingStationService", () => ({
    getLoadingStations: vi.fn()
}));

describe("carDataService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("maps full data set with loading station objects", async () => {
        const {getLoadingStations} = await import("@/firebase/services/loadingStationService");
        vi.mocked(getLoadingStations).mockResolvedValue([
            {id: "ls-1", name: "carport"}
        ]);
        const tsDate = new Date("2026-02-18T10:00:00.000Z");
        firestoreMocks.getDocs.mockResolvedValue({
            empty: false,
            docs: [
                {
                    id: "doc-1",
                    get: vi.fn((key: string) => {
                        if (key === "date") return {toDate: () => tsDate};
                        if (key === "kilometer") return 1500;
                        if (key === "power") return 15.5;
                        if (key === "name") return "Tester";
                        if (key === "loadingStationId") return "ls-1";
                        return undefined;
                    })
                }
            ]
        });

        const {getFullDataSet} = await import("./carDataService");
        const result = await getFullDataSet("Zoe", {year: "2026", month: "02"});

        expect(result).toEqual([
            {
                id: "doc-1",
                date: tsDate,
                kilometer: 1500,
                power: 15.5,
                name: "Tester",
                loadingStation: {id: "ls-1", name: "carport"}
            }
        ]);
    });

    it("loads all docs between months and sorts by kilometer", async () => {
        firestoreMocks.getDocs
            .mockResolvedValueOnce({
                docs: [{id: "a", data: () => ({kilometer: 250})}]
            })
            .mockResolvedValueOnce({
                docs: [{id: "b", data: () => ({kilometer: 100})}]
            });

        const {loadAllConsumptionDocsBetween} = await import("./carDataService");
        const result = await loadAllConsumptionDocsBetween(
            {year: "2026", month: "1"},
            {year: "2026", month: "2"},
            "Zoe"
        );

        expect(result.map((item) => item.id)).toEqual(["b", "a"]);
    });

    it("writes rounded power and kilometer updates", async () => {
        firestoreMocks.addDoc.mockResolvedValue({});
        firestoreMocks.updateDoc.mockResolvedValue(undefined);

        const {addDataSetToCollection, changeDataSetInCollection, updateCarKilometer} = await import("./carDataService");
        addDataSetToCollection("Zoe", {
            date: new Date("2026-02-18T10:00:00.000Z"),
            kilometer: 1111,
            power: 15.56,
            name: "Tester",
            loadingStation: {id: "ls-1", name: "carport"}
        });
        changeDataSetInCollection(
            "Zoe",
            new Date("2026-02-18T10:00:00.000Z"),
            22.34,
            2222,
            {id: "ls-2", name: "official"},
            "doc-1"
        );
        await updateCarKilometer("Zoe", 3333, 3000);

        expect(firestoreMocks.addDoc).toHaveBeenCalled();
        expect(firestoreMocks.updateDoc).toHaveBeenCalled();
    });
});
