import {describe, expect, it, vi} from "vitest";
import {buildDownloadBuildingCsvText} from "@/components/features/building/modals/DownloadBuildingCsv/DownloadBuildingCsv.logic";

describe("DownloadBuildingCsv logic", () => {
    it("builds semicolon-separated csv rows with header", () => {
        const text = buildDownloadBuildingCsvText(
            [
                {
                    house: {id: "h1", name: "House", flats: []},
                    flat: {id: "f1", name: "Flat", rooms: []},
                    room: {id: "r1", name: "Room", fields: []},
                    fieldValue: {
                        field: {id: "x", name: "Water"},
                        value: "12.3",
                        day: new Date("2026-02-03T00:00:00.000Z")
                    }
                }
            ],
            {
                house: "House",
                flat: "Flat",
                room: "Room",
                fieldName: "Field",
                fieldValue: "Value",
                day: "Day"
            }
        );

        expect(text).toContain("House;Flat;Room;Field;Value;Day");
        expect(text).toContain("House;Flat;Room;Water;12,3;3;");
    });

    it("renders current house and actions in the modal", async () => {
        vi.resetModules();
        vi.doMock("@/store/hooks", () => ({
            useAppDispatch: () => vi.fn(),
            useAppSelector: () => ({name: "Haus 1"})
        }));
        vi.doMock("@/components/shared/overlay/Modal", () => ({
            default: ({children}: {children: unknown}) => children
        }));

        const {createElement} = await import("react");
        const {renderToStaticMarkup} = await import("react-dom/server");
        const {default: DownloadBuildingCsv} = await import("./DownloadBuildingCsv");

        const html = renderToStaticMarkup(createElement(DownloadBuildingCsv));

        expect(html).toContain("Haus 1");
    });
});
