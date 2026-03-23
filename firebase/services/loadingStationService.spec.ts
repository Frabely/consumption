import {beforeEach, describe, expect, it, vi} from "vitest";

const firestoreMocks = vi.hoisted(() => ({
    collection: vi.fn(),
    getDocs: vi.fn()
}));

vi.mock("@firebase/firestore", () => firestoreMocks);
vi.mock("@/firebase/db", () => ({db: {}}));

describe("loadingStationService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("maps loading stations from firestore docs", async () => {
        const docs = [
            {id: "ls-1", get: vi.fn(() => "carport")},
            {id: "21819916", get: vi.fn(() => "entrance")},
            {id: "ls-3", get: vi.fn(() => "official")}
        ];
        firestoreMocks.getDocs.mockResolvedValue({empty: false, docs});

        const {getLoadingStations} = await import("./loadingStationService");
        const result = await getLoadingStations();

        expect(result).toEqual([
            {id: "ls-1", name: "carport"},
            {id: "21819916", name: "entrance"},
            {id: "ls-3", name: "official"}
        ]);
    });

    it("returns undefined when no docs are found", async () => {
        firestoreMocks.getDocs.mockResolvedValue({empty: true, docs: []});

        const {getLoadingStations} = await import("./loadingStationService");
        const result = await getLoadingStations();

        expect(result).toBeUndefined();
    });
});
