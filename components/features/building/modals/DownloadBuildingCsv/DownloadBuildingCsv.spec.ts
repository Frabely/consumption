import {describe, expect, it, vi} from "vitest";
import {buildDownloadBuildingCsvText} from "@/components/features/building/modals/DownloadBuildingCsv/DownloadBuildingCsv.logic";

type ReactElementLike = {
    type: unknown;
    props?: {
        children?: unknown;
        onClick?: (...args: unknown[]) => void;
        onChange?: (...args: unknown[]) => void;
        type?: string;
        [key: string]: unknown;
    };
};

function isElementLike(node: unknown): node is ReactElementLike {
    return Boolean(node) && typeof node === "object" && "type" in (node as object);
}

function findElements(node: unknown, predicate: (element: ReactElementLike) => boolean): ReactElementLike[] {
    if (!node) {
        return [];
    }
    if (Array.isArray(node)) {
        return node.flatMap((child) => findElements(child, predicate));
    }
    if (!isElementLike(node)) {
        return [];
    }
    const own = predicate(node) ? [node] : [];
    return [...own, ...findElements(node.props?.children, predicate)];
}

async function buildComponent({
    houseName = "Haus 1",
    exportRows = [{
        house: {id: "h1", name: "Haus 1", flats: []},
        flat: {id: "f1", name: "Flat 1", rooms: []},
        room: {id: "r1", name: "Room 1", fields: []},
        fieldValue: {field: {id: "x", name: "Water"}, value: "12.3", day: new Date("2026-02-03T00:00:00.000Z")}
    }]
}: {
    houseName?: string;
    exportRows?: unknown[];
} = {}) {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.stubGlobal("alert", vi.fn());

    const dispatch = vi.fn();
    const setCurrentDateValue = vi.fn();
    const getFieldValuesForExport = vi.fn().mockResolvedValue(exportRows);
    const createObjectURL = vi.fn(() => "blob:building");
    const click = vi.fn();
    const anchor = {download: "", href: "", click};
    const createElement = vi.fn(() => anchor);

    if (!("createObjectURL" in globalThis.URL)) {
        Object.defineProperty(globalThis.URL, "createObjectURL", {configurable: true, writable: true, value: createObjectURL});
    } else {
        vi.spyOn(globalThis.URL, "createObjectURL").mockImplementation(createObjectURL);
    }
    vi.stubGlobal("document", {createElement});

    vi.doMock("react", async () => {
        const actual = await vi.importActual<typeof import("react")>("react");
        return {
            ...actual,
            useState: () => [{year: "2026", month: "02"}, setCurrentDateValue]
        };
    });
    vi.doMock("@/store/hooks", () => ({
        useAppDispatch: () => dispatch,
        useAppSelector: () => ({name: houseName})
    }));
    vi.doMock("@/components/shared/overlay/Modal", () => ({
        default: function ModalMock() {
            return null;
        }
    }));
    vi.doMock("@/firebase/functions", () => ({
        getFieldValuesForExport
    }));
    vi.doMock("@/store/reducer/modalState", () => ({
        setModalStateNone: () => ({type: "setModalStateNone"})
    }));
    vi.doMock("@/domain/fieldValueMapping", async () => {
        const actual = await vi.importActual<typeof import("@/domain/fieldValueMapping")>("@/domain/fieldValueMapping");
        return {
            ...actual,
            parseYearMonthInput: vi.fn((value: string) => value === "2025-12" ? {year: "2025", month: "12"} : undefined)
        };
    });

    const {default: DownloadBuildingCsv} = await import("./DownloadBuildingCsv");
    const element = DownloadBuildingCsv({});
    return {element, dispatch, setCurrentDateValue, getFieldValuesForExport, createObjectURL, createElement, anchor};
}

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

    it("handles abort/date/download and no-data paths", async () => {
        const {
            element,
            dispatch,
            setCurrentDateValue,
            getFieldValuesForExport,
            createObjectURL,
            createElement,
            anchor
        } = await buildComponent();

        const monthInput = findElements(element, (currentElement) => currentElement.type === "input" && currentElement.props?.type === "month")[0];
        monthInput?.props?.onChange?.({target: {value: "2025-12"}});
        expect(setCurrentDateValue).toHaveBeenCalledWith({year: "2025", month: "12"});

        const buttons = findElements(element, (currentElement) => currentElement.type === "button");
        buttons[0]?.props?.onClick?.();
        expect(dispatch).toHaveBeenCalledWith({type: "setModalStateNone"});

        buttons[1]?.props?.onClick?.();
        await Promise.resolve();
        expect(getFieldValuesForExport).toHaveBeenCalledWith("2026", "02");
        expect(createObjectURL).toHaveBeenCalled();
        expect(createElement).toHaveBeenCalledWith("a");
        expect(anchor.download).toBe("2026-02.csv");
        expect(anchor.href).toBe("blob:building");
        expect(anchor.click).toHaveBeenCalled();

        const noData = await buildComponent({exportRows: []});
        const noDataDownload = findElements(noData.element, (currentElement) => currentElement.type === "button")[1];
        noDataDownload?.props?.onClick?.();
        await Promise.resolve();
        expect(globalThis.alert).toHaveBeenCalled();
    });
});
