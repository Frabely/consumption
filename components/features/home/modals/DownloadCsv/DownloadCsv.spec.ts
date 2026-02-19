import {describe, expect, it, vi} from "vitest";

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

function findElement(node: unknown, predicate: (element: ReactElementLike) => boolean): ReactElementLike | undefined {
    if (!node) {
        return undefined;
    }
    if (Array.isArray(node)) {
        for (const child of node) {
            const found = findElement(child, predicate);
            if (found) {
                return found;
            }
        }
        return undefined;
    }
    if (!isElementLike(node)) {
        return undefined;
    }
    if (predicate(node)) {
        return node;
    }
    return findElement(node.props?.children, predicate);
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
    carName = "Zoe",
    dataSetResult = [
        {
            date: new Date("2026-02-10T10:15:00.000Z"),
            kilometer: 12345,
            power: 18.5,
            name: "Tester",
            loadingStation: {id: "station-1", name: "carport"}
        }
    ]
}: {
    carName?: string | undefined;
    dataSetResult?: unknown[] | null | undefined;
} = {}) {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.stubGlobal("alert", vi.fn());

    const dispatch = vi.fn();
    const setCurrentDateValue = vi.fn();
    const getFullDataSet = vi.fn().mockResolvedValue(dataSetResult);
    const createObjectURL = vi.fn(() => "blob:test");
    const click = vi.fn();
    const anchor = {download: "", href: "", click};
    const createElement = vi.fn(() => anchor);

    if (!("createObjectURL" in globalThis.URL)) {
        Object.defineProperty(globalThis.URL, "createObjectURL", {
            configurable: true,
            writable: true,
            value: createObjectURL
        });
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
        useAppSelector: () => ({name: carName})
    }));
    vi.doMock("@/components/shared/overlay/Modal", () => ({
        default: function ModalMock() {
            return null;
        }
    }));
    vi.doMock("@/firebase/functions", () => ({
        getFullDataSet
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

    const {default: DownloadCsv} = await import("./DownloadCsv");
    const element = DownloadCsv({});

    return {
        element,
        dispatch,
        setCurrentDateValue,
        getFullDataSet,
        createObjectURL,
        createElement,
        anchor
    };
}

describe("DownloadCsv component", () => {
    it("aborts modal, parses date input and downloads csv", async () => {
        const {
            element,
            dispatch,
            setCurrentDateValue,
            getFullDataSet,
            createObjectURL,
            createElement,
            anchor
        } = await buildComponent();

        const monthInput = findElement(element, (currentElement) => currentElement.type === "input" && currentElement.props?.type === "month");
        monthInput?.props?.onChange?.({target: {value: "2025-12"}});
        expect(setCurrentDateValue).toHaveBeenCalledWith({year: "2025", month: "12"});

        const buttons = findElements(element, (currentElement) => currentElement.type === "button");
        const abortButton = buttons[0];
        const downloadButton = buttons[1];
        abortButton?.props?.onClick?.();
        expect(dispatch).toHaveBeenCalledWith({type: "setModalStateNone"});

        downloadButton?.props?.onClick?.();
        await Promise.resolve();

        expect(getFullDataSet).toHaveBeenCalledWith("Zoe", {year: "2026", month: "02"});
        expect(createObjectURL).toHaveBeenCalled();
        expect(createElement).toHaveBeenCalledWith("a");
        expect(anchor.download).toBe("2026-02.csv");
        expect(anchor.href).toBe("blob:test");
        expect(anchor.click).toHaveBeenCalled();
    });

    it("shows no-data alert when dataset result is empty", async () => {
        const {element, getFullDataSet} = await buildComponent({
            dataSetResult: null
        });
        const buttons = findElements(element, (currentElement) => currentElement.type === "button");
        const downloadButton = buttons[1];
        downloadButton?.props?.onClick?.();
        await Promise.resolve();
        await Promise.resolve();

        expect(getFullDataSet).toHaveBeenCalled();
        expect(globalThis.alert).toHaveBeenCalled();
    });

    it("skips dataset download when no car is selected", async () => {
        const {element, getFullDataSet} = await buildComponent({
            carName: ""
        });
        const buttons = findElements(element, (currentElement) => currentElement.type === "button");
        const downloadButton = buttons[1];
        downloadButton?.props?.onClick?.();

        expect(getFullDataSet).not.toHaveBeenCalled();
    });
});
