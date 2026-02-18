import {describe, expect, it, vi} from "vitest";
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

    it("renders field values section for selected room", async () => {
        vi.resetModules();
        vi.doMock("@/store/hooks", () => ({
            useAppSelector: () => ({name: "House 1"})
        }));
        vi.doMock("@/components/shared/overlay/Modal", () => ({
            default: ({children}: {children: unknown}) => children
        }));
        vi.doMock("@/components/shared/forms/CustomSelect", () => ({
            default: ({defaultValue}: {defaultValue: string}) => defaultValue
        }));
        vi.doMock("@/components/shared/forms/FieldInput", () => ({
            default: ({value}: {value: string | null}) => value ?? ""
        }));
        vi.doMock("@/firebase/functions", () => ({
            getFieldValues: () => Promise.resolve([]),
            setFieldValue: vi.fn(),
            deleteFieldValue: vi.fn()
        }));

        const {createElement} = await import("react");
        const {renderToStaticMarkup} = await import("react-dom/server");
        const {default: AddFloorData} = await import("./AddFloorData");

        const html = renderToStaticMarkup(createElement(AddFloorData, {
            flat: {
                id: "f1",
                name: "Flat 1",
                position: 0,
                rooms: [{id: "r1", name: "Kueche", position: 0, fields: []}]
            }
        }));

        expect(html).toContain("Kueche");
    });
});
