import {beforeEach, describe, expect, it, vi} from "vitest";

const firestoreMocks = vi.hoisted(() => ({
    addDoc: vi.fn(),
    collection: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    limit: vi.fn(),
    query: vi.fn(),
    Timestamp: {
        fromDate: vi.fn((date: Date) => ({toDate: () => date}))
    },
    updateDoc: vi.fn(),
    where: vi.fn()
}));

vi.mock("@firebase/firestore", () => firestoreMocks);
vi.mock("firebase/firestore", () => ({
    DocumentReference: class {},
    QueryFieldFilterConstraint: class {},
    and: vi.fn((...args: unknown[]) => args)
}));
vi.mock("@/firebase/db", () => ({db: {}}));
vi.mock("@/firebase/services/buildingStructureService", () => ({
    getHouses: vi.fn()
}));

describe("fieldValueService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("queries setFieldValue with fieldId, flatId and roomId", async () => {
        firestoreMocks.getDoc.mockResolvedValue({
            ref: {path: "field/ref"}
        });
        firestoreMocks.getDocs.mockResolvedValue({
            empty: true,
            docs: []
        });
        firestoreMocks.addDoc.mockResolvedValue({id: "created"});

        const {setFieldValue} = await import("@/firebase/services/fieldValueService");
        await setFieldValue(
            "Haus",
            {id: "flat-1", name: "Flat", rooms: [], position: 0},
            {id: "room-1", name: "Room", fields: [], position: 0},
            {id: "field-1", name: "Field", position: 0},
            "2026",
            "02",
            42
        );

        expect(firestoreMocks.where).toHaveBeenCalledWith("fieldId", "==", "field-1");
        expect(firestoreMocks.where).toHaveBeenCalledWith("flatId", "==", "flat-1");
        expect(firestoreMocks.where).toHaveBeenCalledWith("roomId", "==", "room-1");
        expect(firestoreMocks.addDoc).toHaveBeenCalledTimes(1);
    });

    it("updates existing value instead of creating when matching document exists", async () => {
        firestoreMocks.getDoc.mockResolvedValue({
            ref: {path: "field/ref"}
        });
        firestoreMocks.getDocs.mockResolvedValue({
            empty: false,
            docs: [{ref: {id: "value-doc"}}]
        });
        firestoreMocks.updateDoc.mockResolvedValue(undefined);

        const {setFieldValue} = await import("@/firebase/services/fieldValueService");
        await setFieldValue(
            "Haus",
            {id: "flat-1", name: "Flat", rooms: [], position: 0},
            {id: "room-1", name: "Room", fields: [], position: 0},
            {id: "field-1", name: "Field", position: 0},
            "2026",
            "02",
            77
        );

        expect(firestoreMocks.updateDoc).toHaveBeenCalledTimes(1);
        expect(firestoreMocks.addDoc).not.toHaveBeenCalled();
    });
});
