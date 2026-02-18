import {describe, expect, it} from "vitest";
import {canAddFieldByName, canAddRoomByName} from "@/components/features/building/modals/AddFloor/AddFloor.logic";

describe("AddFloor logic", () => {
    it("validates room names for add action", () => {
        const rooms = [{id: "1", name: "Kueche", fields: []}];

        expect(canAddRoomByName("Bad", rooms)).toBe(true);
        expect(canAddRoomByName("Kueche", rooms)).toBe(false);
        expect(canAddRoomByName("", rooms)).toBe(false);
    });

    it("validates field names for selected room", () => {
        const room = {id: "1", name: "Bad", fields: [{id: "f1", name: "Wasser"}]};

        expect(canAddFieldByName("Strom", room)).toBe(true);
        expect(canAddFieldByName("Wasser", room)).toBe(false);
        expect(canAddFieldByName("", room)).toBe(false);
        expect(canAddFieldByName("Strom", undefined)).toBe(false);
    });
});
