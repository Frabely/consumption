import {beforeEach, describe, expect, it, vi} from "vitest";

const firestoreMocks = vi.hoisted(() => ({
    addDoc: vi.fn(),
    collection: vi.fn(),
    deleteDoc: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    updateDoc: vi.fn()
}));

vi.mock("@firebase/firestore", () => firestoreMocks);
vi.mock("@/firebase/db", () => ({db: {}}));

describe("buildingStructureService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("loads fields sorted by position and keeps undefined positions last", async () => {
        firestoreMocks.getDocs.mockResolvedValue({
            empty: false,
            docs: [
                {id: "f2", get: vi.fn((key: string) => key === "name" ? "B" : undefined)},
                {id: "f1", get: vi.fn((key: string) => key === "name" ? "A" : 1)}
            ]
        });

        const {getFields} = await import("./buildingStructureService");
        const result = await getFields("h1", "fl1", "r1");

        expect(result[0].id).toBe("f1");
        expect(result[1].id).toBe("f2");
    });

    it("updates fields by deleting removed, adding new and updating existing ones", async () => {
        firestoreMocks.getDocs.mockResolvedValue({
            docs: [
                {id: "old", ref: {id: "old"}},
                {id: "keep", ref: {id: "keep"}}
            ]
        });
        firestoreMocks.deleteDoc.mockResolvedValue(undefined);
        firestoreMocks.addDoc.mockResolvedValue({id: "created"});
        firestoreMocks.updateDoc.mockResolvedValue(undefined);

        const {updateFields} = await import("./buildingStructureService");
        await updateFields({} as never, [
            {id: "keep", name: "Updated", position: 0},
            {id: "", name: "New", position: 1}
        ]);

        expect(firestoreMocks.deleteDoc).toHaveBeenCalledTimes(1);
        expect(firestoreMocks.addDoc).toHaveBeenCalledTimes(1);
        expect(firestoreMocks.updateDoc).toHaveBeenCalledTimes(1);
    });

    it("loads rooms with nested fields and sorted positions", async () => {
        firestoreMocks.getDocs
            .mockResolvedValueOnce({
                empty: false,
                docs: [
                    {id: "r2", get: vi.fn((key: string) => key === "name" ? "R2" : 2)},
                    {id: "r1", get: vi.fn((key: string) => key === "name" ? "R1" : 1)}
                ]
            })
            .mockResolvedValueOnce({
                empty: false,
                docs: [{id: "f1", get: vi.fn((key: string) => key === "name" ? "F1" : 0)}]
            })
            .mockResolvedValueOnce({
                empty: true,
                docs: []
            });

        const {getRooms} = await import("./buildingStructureService");
        const result = await getRooms("h1", "fl1");

        expect(result.map((room) => room.id)).toEqual(["r1", "r2"]);
        expect(result[0].fields).toEqual([]);
        expect(result[1].fields).toHaveLength(1);
    });

    it("loads houses with nested flats, rooms and fields", async () => {
        firestoreMocks.getDocs
            .mockResolvedValueOnce({
                empty: false,
                docs: [{id: "house-1", get: vi.fn(() => 1)}]
            })
            .mockResolvedValueOnce({
                empty: false,
                docs: [{id: "flat-1", get: vi.fn((key: string) => key === "name" ? "Flat 1" : 0)}]
            })
            .mockResolvedValueOnce({
                empty: false,
                docs: [{id: "room-1", get: vi.fn((key: string) => key === "name" ? "Room 1" : 0)}]
            })
            .mockResolvedValueOnce({
                empty: false,
                docs: [{id: "field-1", get: vi.fn((key: string) => key === "name" ? "Field 1" : 0)}]
            });

        const {getHouses} = await import("./buildingStructureService");
        const houses = await getHouses();

        expect(houses).toHaveLength(1);
        expect(houses[0].flats[0].rooms[0].fields[0].id).toBe("field-1");
    });

    it("loads flats with nested rooms and respects sorting", async () => {
        firestoreMocks.getDocs
            .mockResolvedValueOnce({
                empty: false,
                docs: [
                    {id: "flat-b", get: vi.fn((key: string) => key === "name" ? "Flat B" : undefined)},
                    {id: "flat-a", get: vi.fn((key: string) => key === "name" ? "Flat A" : 1)}
                ]
            })
            .mockResolvedValueOnce({
                empty: true,
                docs: []
            })
            .mockResolvedValueOnce({
                empty: true,
                docs: []
            });

        const {getFlats} = await import("./buildingStructureService");
        const flats = await getFlats("house-1");

        expect(flats.map((flat) => flat.id)).toEqual(["flat-a", "flat-b"]);
    });

    it("creates a flat including nested rooms and fields", async () => {
        firestoreMocks.addDoc
            .mockResolvedValueOnce({id: "flat-1"})
            .mockResolvedValueOnce({id: "room-1"})
            .mockResolvedValueOnce({id: "field-1"});
        firestoreMocks.collection.mockImplementation((...args: unknown[]) => ({path: args.join("/")}));

        const {createFlat} = await import("./buildingStructureService");
        await createFlat({
            id: "",
            name: "Flat 1",
            position: 0,
            rooms: [{
                id: "",
                name: "Room 1",
                position: 0,
                fields: [{id: "", name: "Field 1", position: 0}]
            }]
        }, "house-1");

        expect(firestoreMocks.addDoc).toHaveBeenCalledTimes(3);
    });

    it("updates flat metadata and room collection", async () => {
        firestoreMocks.getDoc.mockResolvedValue({ref: {id: "flat-doc"}});
        firestoreMocks.getDocs.mockResolvedValue({docs: []});
        firestoreMocks.updateDoc.mockResolvedValue(undefined);

        const {updateFlat} = await import("./buildingStructureService");
        await updateFlat("house-1", {
            id: "flat-1",
            name: "Flat Updated",
            position: 1,
            rooms: []
        });

        expect(firestoreMocks.updateDoc).toHaveBeenCalledWith(
            {id: "flat-doc"},
            {name: "Flat Updated", position: 1}
        );
    });

    it("updates rooms by deleting old, adding new and updating existing entries", async () => {
        firestoreMocks.getDocs
            .mockResolvedValueOnce({
                docs: [
                    {id: "old-room", ref: {id: "old-room"}},
                    {id: "keep-room", ref: {id: "keep-room"}}
                ]
            })
            .mockResolvedValueOnce({docs: []});
        firestoreMocks.addDoc
            .mockResolvedValueOnce({id: "new-room", path: "houses/h1/flats/f1/rooms/new-room"})
            .mockResolvedValueOnce({id: "new-field"});
        firestoreMocks.deleteDoc.mockResolvedValue(undefined);
        firestoreMocks.updateDoc.mockResolvedValue(undefined);
        firestoreMocks.collection.mockImplementation((...args: unknown[]) => ({path: args.join("/")}));

        const {updateRooms} = await import("./buildingStructureService");
        await updateRooms(
            {path: "houses/h1/flats/f1/rooms"} as never,
            [
                {id: "", name: "New Room", position: 0, fields: [{id: "", name: "NF", position: 0}]},
                {id: "keep-room", name: "Keep Room", position: 1, fields: []}
            ]
        );

        expect(firestoreMocks.deleteDoc).toHaveBeenCalledTimes(1);
        expect(firestoreMocks.addDoc).toHaveBeenCalledTimes(2);
        expect(firestoreMocks.updateDoc).toHaveBeenCalledTimes(1);
    });

    it("covers service catch blocks for create/update operations", async () => {
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
        const {createFlat, updateFlat, updateRooms, updateFields} = await import("./buildingStructureService");

        firestoreMocks.addDoc.mockRejectedValueOnce(new Error("create failed"));
        await createFlat({
            id: "",
            name: "Flat",
            position: 0,
            rooms: []
        }, "house-1");

        firestoreMocks.getDoc.mockRejectedValueOnce(new Error("update flat failed"));
        await updateFlat("house-1", {
            id: "flat-1",
            name: "Flat",
            position: 0,
            rooms: []
        });

        firestoreMocks.getDocs.mockRejectedValueOnce(new Error("update rooms failed"));
        await updateRooms({path: "rooms/path"} as never, []);

        firestoreMocks.getDocs.mockRejectedValueOnce(new Error("update fields failed"));
        await updateFields({path: "fields/path"} as never, []);

        expect(errorSpy).toHaveBeenCalled();
        errorSpy.mockRestore();
    });
});
