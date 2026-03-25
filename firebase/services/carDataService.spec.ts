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
        firestoreMocks.collection.mockReturnValue({});
        firestoreMocks.doc.mockReturnValue({});
        firestoreMocks.orderBy.mockReturnValue({});
        firestoreMocks.query.mockImplementation((value: unknown) => value);
    });

    it("maps full data set with loading station objects and optional session metadata", async () => {
        const {getLoadingStations} = await import("@/firebase/services/loadingStationService");
        vi.mocked(getLoadingStations).mockResolvedValue([
            {id: "ls-1", name: "carport"}
        ]);
        const tsDate = new Date("2026-02-18T10:00:00.000Z");
        const started = new Date("2026-02-18T09:00:00.000Z");
        const ended = new Date("2026-02-18T09:45:00.000Z");
        const cardId = "card-1";
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
                        if (key === "started") return {toDate: () => started};
                        if (key === "ended") return {toDate: () => ended};
                        if (key === "cardId") return cardId;
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
                started,
                ended,
                cardId,
                loadingStation: {id: "ls-1", name: "carport"}
            }
        ]);
    });

    it("returns undefined optional session metadata when firestore fields are missing", async () => {
        const {getLoadingStations} = await import("@/firebase/services/loadingStationService");
        vi.mocked(getLoadingStations).mockResolvedValue([
            {id: "ls-1", name: "carport"}
        ]);

        firestoreMocks.getDocs.mockResolvedValue({
            empty: false,
            docs: [
                {
                    id: "doc-1",
                    get: vi.fn((key: string) => {
                        if (key === "date") return {toDate: () => new Date("2026-02-18T10:00:00.000Z")};
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

        expect(result?.[0].started).toBeUndefined();
        expect(result?.[0].ended).toBeUndefined();
        expect(result?.[0].cardId).toBeUndefined();
    });

    it("loads all docs between months, maps optional session metadata and sorts by kilometer", async () => {
        const firstDate = new Date("2026-01-15T10:00:00.000Z");
        const secondDate = new Date("2026-02-16T10:00:00.000Z");
        const secondStarted = new Date("2026-02-16T08:30:00.000Z");
        const secondEnded = new Date("2026-02-16T09:10:00.000Z");
        const secondCardId = "card-2";

        firestoreMocks.getDocs
            .mockResolvedValueOnce({
                docs: [{
                    id: "a",
                    data: () => ({kilometer: 250, power: "12.5"}),
                    get: vi.fn((key: string) => {
                        if (key === "date") return {toDate: () => firstDate};
                        return undefined;
                    })
                }]
            })
            .mockResolvedValueOnce({
                docs: [{
                    id: "b",
                    data: () => ({kilometer: 100, power: "11.5"}),
                    get: vi.fn((key: string) => {
                        if (key === "date") return {toDate: () => secondDate};
                        if (key === "started") return {toDate: () => secondStarted};
                        if (key === "ended") return {toDate: () => secondEnded};
                        if (key === "cardId") return secondCardId;
                        return undefined;
                    })
                }]
            });

        const {loadAllConsumptionDocsBetween} = await import("./carDataService");
        const result = await loadAllConsumptionDocsBetween(
            {year: "2026", month: "1"},
            {year: "2026", month: "2"},
            "Zoe"
        );

        expect(result.map((item) => item.id)).toEqual(["b", "a"]);
        expect(result[0].data.started).toEqual(secondStarted);
        expect(result[0].data.ended).toEqual(secondEnded);
        expect(result[0].data.cardId).toBe(secondCardId);
        expect(result[1].data.started).toBeUndefined();
        expect(result[1].data.ended).toBeUndefined();
        expect(result[1].data.cardId).toBeUndefined();
    });

    it("writes power with four decimal places and optional session metadata", async () => {
        firestoreMocks.addDoc.mockResolvedValue({});
        firestoreMocks.updateDoc.mockResolvedValue(undefined);
        const started = new Date("2026-02-18T08:00:00.000Z");
        const ended = new Date("2026-02-18T09:00:00.000Z");
        const cardId = "card-3";

        const {addDataSetToCollection, changeDataSetInCollection, updateCarKilometer} = await import("./carDataService");
        await addDataSetToCollection("Zoe", {
            date: new Date("2026-02-18T10:00:00.000Z"),
            kilometer: 1111,
            power: 15.56,
            name: "Tester",
            loadingStation: {id: "ls-1", name: "carport"},
            started,
            ended,
            cardId
        });
        await changeDataSetInCollection("Zoe", {
            id: "doc-1",
            date: new Date("2026-02-18T10:00:00.000Z"),
            power: 22.34,
            kilometer: 2222,
            loadingStation: {id: "ls-2", name: "official"},
            started,
            ended,
            cardId
        });
        await updateCarKilometer("Zoe", 3333, 3000);

        expect(firestoreMocks.addDoc).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                power: "15.5600",
                started,
                ended,
                cardId
            })
        );
        expect(firestoreMocks.updateDoc).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                power: "22.3400",
                started,
                ended,
                cardId
            })
        );
    });

    it("omits optional session metadata when it is not provided", async () => {
        firestoreMocks.addDoc.mockResolvedValue({});
        firestoreMocks.updateDoc.mockResolvedValue(undefined);

        const {addDataSetToCollection, changeDataSetInCollection} = await import("./carDataService");
        await addDataSetToCollection("Zoe", {
            date: new Date("2026-02-18T10:00:00.000Z"),
            kilometer: 1111,
            power: 15.56,
            name: "Tester",
            loadingStation: {id: "ls-1", name: "carport"}
        });
        await changeDataSetInCollection("Zoe", {
            id: "doc-1",
            date: new Date("2026-02-18T10:00:00.000Z"),
            power: 22.34,
            kilometer: 2222,
            loadingStation: {id: "ls-2", name: "official"}
        });

        expect(firestoreMocks.addDoc).toHaveBeenCalledWith(
            expect.anything(),
            expect.not.objectContaining({
                started: expect.anything(),
                ended: expect.anything(),
                cardId: expect.anything()
            })
        );
        expect(firestoreMocks.updateDoc).toHaveBeenCalledWith(
            expect.anything(),
            expect.not.objectContaining({
                started: expect.anything(),
                ended: expect.anything(),
                cardId: expect.anything()
            })
        );
    });
});
