import {describe, expect, it, vi} from "vitest";
import {canAddFieldByName, canAddRoomByName} from "@/components/features/building/modals/AddFloor/AddFloor.logic";
import de from "@/constants/de.json";

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

    it("renders modal content for floor editing", async () => {
        vi.resetModules();
        vi.doMock("@/store/hooks", () => {
            const values = [
                {name: "House 1", flats: []},
                "None"
            ];
            return {
                useAppDispatch: () => vi.fn(),
                useAppSelector: () => values.shift()
            };
        });
        vi.doMock("@/components/shared/overlay/Modal", () => ({
            default: ({children}: {children: unknown}) => children
        }));
        vi.doMock("@/components/shared/ui/CustomButton", () => ({
            default: ({label}: {label: string}) => label
        }));

        const {createElement} = await import("react");
        const {renderToStaticMarkup} = await import("react-dom/server");
        const {default: AddFloor} = await import("./AddFloor");

        const html = renderToStaticMarkup(createElement(AddFloor, {newFlatPosition: 0}));

        expect(html).toContain(de.buttonLabels.save);
    });
});
