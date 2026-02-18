import {beforeEach, describe, expect, it, vi} from "vitest";

const firestoreMocks = vi.hoisted(() => ({
    collection: vi.fn(),
    getDocs: vi.fn()
}));

vi.mock("@firebase/firestore", () => firestoreMocks);
vi.mock("@/firebase/db", () => ({db: {}}));

describe("carService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("maps firestore car documents to Car entries", async () => {
        const docs = [
            {
                id: "Zoe",
                get: vi.fn((key: string) => key === "kilometer" ? 1000 : 900)
            },
            {
                id: "BMW",
                get: vi.fn((key: string) => key === "kilometer" ? 2000 : 1500)
            }
        ];
        firestoreMocks.getDocs.mockResolvedValue({empty: false, docs});

        const {getCars} = await import("./carService");
        const result = await getCars();

        expect(result).toEqual([
            {name: "Zoe", kilometer: 1000, prevKilometer: 900},
            {name: "BMW", kilometer: 2000, prevKilometer: 1500}
        ]);
    });

    it("returns empty list when firestore request fails", async () => {
        firestoreMocks.getDocs.mockRejectedValue(new Error("boom"));

        const {getCars} = await import("./carService");
        const result = await getCars();

        expect(result).toEqual([]);
    });
});
