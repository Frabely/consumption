import {describe, expect, it} from "vitest";
import {
    isFieldValueValid,
    resolveRoomByName
} from "@/components/features/building/modals/AddFloorData/AddFloorData.logic";

describe("AddFloorData logic", () => {
    it("validates numeric field values", () => {
        expect(isFieldValueValid("12")).toBe(true);
        expect(isFieldValueValid("12.5")).toBe(true);
        expect(isFieldValueValid("abc")).toBe(false);
        expect(isFieldValueValid("")).toBe(false);
        expect(isFieldValueValid(null)).toBe(false);
    });

    it("resolves room by name", () => {
        const rooms = [
            {id: "1", name: "Bad", fields: []},
            {id: "2", name: "Kueche", fields: []}
        ];

        expect(resolveRoomByName(rooms, "Kueche")).toEqual({id: "2", name: "Kueche", fields: []});
        expect(resolveRoomByName(rooms, "Flur")).toBeUndefined();
    });
});
