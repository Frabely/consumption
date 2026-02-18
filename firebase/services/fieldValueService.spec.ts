import {beforeEach, describe, expect, it, vi} from "vitest";

const firestoreMocks = vi.hoisted(() => ({
    addDoc: vi.fn(),
    and: vi.fn((...args: unknown[]) => args),
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
    and: firestoreMocks.and
}));
vi.mock("@/firebase/db", () => ({db: {}}));
vi.mock("@/firebase/services/buildingStructureService", () => ({
    getHouses: vi.fn()
}));

describe("fieldValueService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns mapped field values from firestore", async () => {
        firestoreMocks.getDocs.mockResolvedValueOnce({
            docs: [
                {
                    get: vi.fn((key: string) => {
                        if (key === "field") return {path: "field/ref"};
                        if (key === "day") return {toDate: () => new Date("2026-02-18T00:00:00.000Z")};
                        if (key === "value") return 12;
                        return undefined;
                    })
                }
            ]
        });
        firestoreMocks.getDoc.mockResolvedValue({
            id: "field-1",
            get: vi.fn((key: string) => key === "name" ? "Water" : 0)
        });

        const {getFieldValues} = await import("./fieldValueService");
        const result = await getFieldValues("2026", "02");

        expect(result).toEqual([
            {
                field: {id: "field-1", name: "Water", position: 0},
                day: new Date("2026-02-18T00:00:00.000Z"),
                value: 12
            }
        ]);
    });

    it("creates export entries by matching field ids to building structure", async () => {
        const {getHouses} = await import("@/firebase/services/buildingStructureService");
        vi.mocked(getHouses).mockResolvedValue([
            {
                id: "h1",
                name: "Haus",
                flats: [{
                    id: "f1",
                    name: "Wohnung",
                    position: 0,
                    rooms: [{
                        id: "r1",
                        name: "Kueche",
                        position: 0,
                        fields: [{id: "field-1", name: "Water", position: 0}]
                    }]
                }]
            }
        ]);
        firestoreMocks.getDocs.mockResolvedValueOnce({
            docs: [
                {
                    get: vi.fn((key: string) => {
                        if (key === "field") return {path: "field/ref"};
                        if (key === "day") return {toDate: () => new Date("2026-02-18T00:00:00.000Z")};
                        if (key === "value") return 55;
                        return undefined;
                    })
                }
            ]
        });
        firestoreMocks.getDoc.mockResolvedValue({
            id: "field-1",
            get: vi.fn((key: string) => key === "name" ? "Water" : 0)
        });

        const {getFieldValuesForExport} = await import("./fieldValueService");
        const result = await getFieldValuesForExport("2026", "02");

        expect(result).toHaveLength(1);
        expect(result[0].house.name).toBe("Haus");
        expect(result[0].fieldValue.field.id).toBe("field-1");
    });

    it("updates existing field value when query finds an entry", async () => {
        firestoreMocks.getDoc.mockResolvedValue({
            ref: {path: "field/ref"}
        });
        firestoreMocks.getDocs.mockResolvedValue({
            empty: false,
            docs: [{ref: {id: "value-doc"}}]
        });
        firestoreMocks.updateDoc.mockResolvedValue(undefined);

        const {setFieldValue} = await import("./fieldValueService");
        await setFieldValue(
            "Haus",
            {id: "flat-1", name: "Flat", rooms: [], position: 0},
            {id: "room-1", name: "Room", fields: [], position: 0},
            {id: "field-1", name: "Water", position: 0},
            "2026",
            "02",
            77
        );

        expect(firestoreMocks.updateDoc).toHaveBeenCalledTimes(1);
    });

    it("adds a new field value when no entry exists yet", async () => {
        firestoreMocks.getDoc.mockResolvedValue({
            ref: {path: "field/ref"}
        });
        firestoreMocks.getDocs.mockResolvedValue({
            empty: true,
            docs: []
        });
        firestoreMocks.addDoc.mockResolvedValue({id: "created"});

        const {setFieldValue} = await import("./fieldValueService");
        await setFieldValue(
            "Haus",
            {id: "flat-1", name: "Flat", rooms: [], position: 0},
            {id: "room-1", name: "Room", fields: [], position: 0},
            {id: "field-1", name: "Water", position: 0},
            "2026",
            "02",
            88
        );

        expect(firestoreMocks.addDoc).toHaveBeenCalledTimes(1);
    });

    it("deletes a field value by setting it to null when entry exists", async () => {
        firestoreMocks.getDoc.mockResolvedValue({
            ref: {path: "field/ref"}
        });
        firestoreMocks.getDocs.mockResolvedValue({
            empty: false,
            docs: [{ref: {id: "value-doc"}}]
        });
        firestoreMocks.updateDoc.mockResolvedValue(undefined);

        const {deleteFieldValue} = await import("./fieldValueService");
        await deleteFieldValue(
            "Haus",
            {id: "flat-1", name: "Flat", rooms: [], position: 0},
            {id: "room-1", name: "Room", fields: [], position: 0},
            {id: "field-1", name: "Water", position: 0},
            "2026",
            "02"
        );

        expect(firestoreMocks.updateDoc).toHaveBeenCalledWith({id: "value-doc"}, {value: null});
    });

    it("returns empty field values when firestore query throws", async () => {
        firestoreMocks.getDocs.mockRejectedValue(new Error("query failed"));

        const {getFieldValues} = await import("./fieldValueService");
        const result = await getFieldValues("2026", "02");

        expect(result).toEqual([]);
    });

    it("returns empty export list when house loading throws", async () => {
        const {getHouses} = await import("@/firebase/services/buildingStructureService");
        vi.mocked(getHouses).mockRejectedValue(new Error("houses failed"));

        const {getFieldValuesForExport} = await import("./fieldValueService");
        const result = await getFieldValuesForExport("2026", "02");

        expect(result).toEqual([]);
    });

    it("swallows errors in setFieldValue and deleteFieldValue catch blocks", async () => {
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
        firestoreMocks.getDoc.mockRejectedValue(new Error("doc failed"));

        const {setFieldValue, deleteFieldValue} = await import("./fieldValueService");
        await setFieldValue(
            "Haus",
            {id: "flat-1", name: "Flat", rooms: [], position: 0},
            {id: "room-1", name: "Room", fields: [], position: 0},
            {id: "field-1", name: "Water", position: 0},
            "2026",
            "02",
            99
        );
        await deleteFieldValue(
            "Haus",
            {id: "flat-1", name: "Flat", rooms: [], position: 0},
            {id: "room-1", name: "Room", fields: [], position: 0},
            {id: "field-1", name: "Water", position: 0},
            "2026",
            "02"
        );

        expect(errorSpy).toHaveBeenCalled();
        errorSpy.mockRestore();
    });
});
