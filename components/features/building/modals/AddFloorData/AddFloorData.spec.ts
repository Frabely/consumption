import {describe, expect, it, vi} from "vitest";
import {
    isFieldValueValid,
    resolveRoomByName
} from "@/components/features/building/modals/AddFloorData/AddFloorData.logic";
import de from "@/constants/de.json";

type ReactElementLike = {
    type: unknown;
    props?: {
        children?: unknown;
        onClick?: (...args: unknown[]) => void;
        onChange?: (...args: unknown[]) => void;
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
    fieldValue = "42.5",
    isValueValid = true
}: {
    fieldValue?: string | null;
    isValueValid?: boolean;
} = {}) {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.stubGlobal("alert", vi.fn());

    const flat = {
        id: "flat-1",
        name: "Flat 1",
        position: 0,
        rooms: [
            {id: "r1", name: "Kueche", position: 0, fields: [{id: "f1", name: "Wasser", position: 0}]},
            {id: "r2", name: "Bad", position: 1, fields: [{id: "f2", name: "Strom", position: 0}]}
        ]
    };

    const setFieldValue = vi.fn().mockResolvedValue(undefined);
    const deleteFieldValue = vi.fn().mockResolvedValue(undefined);
    const getFieldValues = vi.fn().mockResolvedValue([]);
    const setCurrentDateValue = vi.fn();
    const setCurrentRoom = vi.fn();
    const setAllFieldValues = vi.fn();
    const setCurrentFieldValues = vi.fn();
    const CustomSelectMock = function CustomSelectMock() {
        return null;
    };
    const FieldInputMock = function FieldInputMock() {
        return null;
    };

    vi.doMock("react", async () => {
        const actual = await vi.importActual<typeof import("react")>("react");
        let stateCall = 0;
        return {
            ...actual,
            useEffect: (callback: () => void) => callback(),
            useState: () => {
                stateCall += 1;
                if (stateCall === 1) {
                    return [flat.rooms[0], setCurrentRoom] as const;
                }
                if (stateCall === 2) {
                    return [{year: "2026", month: "02"}, setCurrentDateValue] as const;
                }
                if (stateCall === 3) {
                    return [[], setAllFieldValues] as const;
                }
                return [[{field: flat.rooms[0].fields[0], value: fieldValue}], setCurrentFieldValues] as const;
            }
        };
    });

    vi.doMock("@/store/hooks", () => ({
        useAppSelector: () => ({name: "House 1"})
    }));
    vi.doMock("@/components/shared/overlay/Modal", () => ({
        default: function ModalMock() {
            return null;
        }
    }));
    vi.doMock("@/components/shared/forms/CustomSelect", () => ({
        default: CustomSelectMock
    }));
    vi.doMock("@/components/shared/forms/FieldInput", () => ({
        default: FieldInputMock
    }));
    vi.doMock("@/firebase/functions", () => ({
        getFieldValues,
        setFieldValue,
        deleteFieldValue
    }));
    vi.doMock("@/components/features/building/modals/AddFloorData/AddFloorData.logic", async () => {
        const actual = await vi.importActual<typeof import("./AddFloorData.logic")>("./AddFloorData.logic");
        return {
            ...actual,
            isFieldValueValid: () => isValueValid
        };
    });
    vi.doMock("@/domain/fieldValueMapping", async () => {
        const actual = await vi.importActual<typeof import("@/domain/fieldValueMapping")>("@/domain/fieldValueMapping");
        return {
            ...actual,
            parseYearMonthInput: vi.fn((value: string) => {
                if (value === "2025-11") {
                    return {year: "2025", month: "11"};
                }
                return undefined;
            }),
            filterFieldValuesByRoom: vi.fn(() => [{field: flat.rooms[1].fields[0], value: "17"}])
        };
    });

    const {default: AddFloorData} = await import("./AddFloorData");
    const element = AddFloorData({flat});

    return {
        element,
        setFieldValue,
        deleteFieldValue,
        getFieldValues,
        setCurrentDateValue,
        setCurrentRoom,
        setCurrentFieldValues,
        CustomSelectMock,
        FieldInputMock,
        flat
    };
}

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

    it("loads field values and reacts to date/room/field actions", async () => {
        const {
            element,
            setFieldValue,
            deleteFieldValue,
            getFieldValues,
            setCurrentDateValue,
            setCurrentRoom,
            setCurrentFieldValues,
            CustomSelectMock,
            FieldInputMock
        } = await buildComponent();

        expect(getFieldValues).toHaveBeenCalledWith("2026", "02", expect.objectContaining({id: "flat-1"}));

        const monthInput = findElement(element, (currentElement) => currentElement.type === "input" && currentElement.props?.type === "month");
        monthInput?.props?.onChange?.({preventDefault: vi.fn(), target: {value: "2025-11"}});
        expect(setCurrentDateValue).toHaveBeenCalledWith({year: "2025", month: "11"});

        const roomSelect = findElement(element, (currentElement) => currentElement.type === CustomSelectMock);
        roomSelect?.props?.onChange?.("Bad");
        expect(setCurrentRoom).toHaveBeenCalledWith(expect.objectContaining({name: "Bad"}));
        expect(setCurrentFieldValues).toHaveBeenCalled();

        const fieldInput = findElement(element, (currentElement) => currentElement.type === FieldInputMock);
        fieldInput?.props?.onChange?.({target: {value: "99"}});
        expect(setCurrentFieldValues).toHaveBeenCalled();

        const actionButtons = findElements(element, (currentElement) => {
            const className = currentElement.props?.className;
            return typeof className === "string" && className.includes("actionIconButton");
        });
        await actionButtons[0]?.props?.onClick?.();
        await actionButtons[1]?.props?.onClick?.();

        expect(setFieldValue).toHaveBeenCalledWith(
            "House 1",
            expect.objectContaining({id: "flat-1"}),
            expect.objectContaining({id: "r1"}),
            expect.objectContaining({id: "f1"}),
            "2026",
            "02",
            99
        );
        expect(deleteFieldValue).toHaveBeenCalled();
    });

    it("does not persist invalid field values", async () => {
        const {element, setFieldValue, deleteFieldValue} = await buildComponent({
            fieldValue: "abc",
            isValueValid: false
        });
        const actionButtons = findElements(element, (currentElement) => {
            const className = currentElement.props?.className;
            return typeof className === "string" && className.includes("actionIconButton");
        });
        await actionButtons[0]?.props?.onClick?.();
        await actionButtons[1]?.props?.onClick?.();

        expect(setFieldValue).not.toHaveBeenCalled();
        expect(deleteFieldValue).not.toHaveBeenCalled();
    });

    it("alerts with translated message after saving field value", async () => {
        const {element} = await buildComponent({fieldValue: "15"});
        const actionButtons = findElements(element, (currentElement) => {
            const className = currentElement.props?.className;
            return typeof className === "string" && className.includes("actionIconButton");
        });
        await actionButtons[0]?.props?.onClick?.();
        await Promise.resolve();

        expect(globalThis.alert).toHaveBeenCalledWith(
            de.messages.fieldSaved
                .replace("{valueFieldName}", "Wasser")
                .replace("{valueNumber}", "15")
        );
    });
});
