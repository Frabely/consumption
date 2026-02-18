import {describe, expect, it, vi} from "vitest";

describe("AddData component", () => {
    it("renders modal title and submit action", async () => {
        vi.resetModules();
        vi.doMock("@/store/hooks", () => {
            const values = [
                "AddCarData",
                {name: "Zoe", kilometer: 100, prevKilometer: 90},
                {name: "Tester"},
                "100",
                "12.5",
                {id: "ls-1", name: "carport"},
                "id-1",
                new Date("2026-02-18T10:00:00.000Z"),
                false
            ];
            return {
                useAppDispatch: () => vi.fn(),
                useAppSelector: () => values.shift()
            };
        });
        vi.doMock("@/components/shared/overlay/Modal", () => ({
            default: ({children}: {children: unknown}) => children
        }));
        vi.doMock("@/components/shared/forms/CustomSelect", () => ({
            default: ({defaultValue}: {defaultValue: string}) => defaultValue
        }));
        vi.doMock("@/firebase/functions", () => ({
            addDataSetToCollection: vi.fn(),
            changeDataSetInCollection: vi.fn(),
            updateCarKilometer: vi.fn()
        }));

        const {createElement} = await import("react");
        const {renderToStaticMarkup} = await import("react-dom/server");
        const {default: AddData} = await import("./AddData");

        const html = renderToStaticMarkup(createElement(AddData, {prevKilometers: 90}));

        expect(html).toContain("input");
        expect(html).toContain("button");
    });
});
