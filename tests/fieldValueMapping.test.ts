import {describe, expect, it} from "vitest";
import {filterFieldValuesByRoom, parseYearMonthInput} from "@/utils/building/fieldValueMapping";
import {FieldValue, Flat} from "@/constants/types";

describe("fieldValueMapping", () => {
    const flat: Flat = {
        id: "flat-1",
        name: "Flat",
        rooms: [
            {
                id: "room-1",
                name: "Room 1",
                fields: [
                    {id: "field-1", name: "F1"},
                    {id: "field-2", name: "F2"}
                ]
            },
            {
                id: "room-2",
                name: "Room 2",
                fields: [{id: "field-3", name: "F3"}]
            }
        ]
    };

    it("maps values to fields of selected room", () => {
        const allFieldValues: FieldValue[] = [
            {field: {id: "field-1", name: "F1"}, value: "12"},
            {field: {id: "field-3", name: "F3"}, value: "99"}
        ];

        const result = filterFieldValuesByRoom(flat, "room-1", allFieldValues);
        expect(result).toEqual([
            {field: {id: "field-1", name: "F1"}, value: "12"},
            {field: {id: "field-2", name: "F2"}, value: null}
        ]);
    });

    it("returns null for invalid year-month input", () => {
        expect(parseYearMonthInput("2026-02")).toEqual({year: "2026", month: "02"});
        expect(parseYearMonthInput("2026")).toBeNull();
    });
});

