import {describe, expect, it, vi} from "vitest";
import de from "@/i18n";
import type {DachsF233AutofillApiResponseDto, DachsF235AutofillApiResponseDto} from "@/common/dto";
import {
    isFieldValueValid,
    mapDachsValuesToFieldValues,
    mergeRoomFieldValues,
    resolveRoomByName,
    shouldShowDachsAutofill
} from "@/components/features/building/modals/AddFloorData/AddFloorData.logic";

type ReactElementLike = {
    type: unknown;
    props?: {
        children?: unknown;
        onClick?: (...args: unknown[]) => void;
        onChange?: (...args: unknown[]) => void;
        [key: string]: unknown;
    };
};

type BuildComponentOptions = {
    currentHouseName?: string;
    currentDateValue?: {year: string; month: string};
    currentFieldValues?: Array<{
        field: {id: string; name: string; position: number};
        value: string | null;
    }>;
    pendingImportedFieldIds?: string[];
    isAutofillNoticeVisible?: boolean;
    flatName?: string;
    rooms?: Array<{
        id: string;
        name: string;
        position: number;
        fields: Array<{id: string; name: string; position: number}>;
    }>;
    dachsValues?: Partial<DachsF233AutofillApiResponseDto & DachsF235AutofillApiResponseDto>;
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
    currentHouseName = "House 1",
    currentDateValue = {
        year: new Date().getFullYear().toString(),
        month: (new Date().getMonth() + 1).toString().padStart(2, "0")
    },
    currentFieldValues = [{field: {id: "f1", name: "Wasser", position: 0}, value: "42.5"}],
    pendingImportedFieldIds = [],
    isAutofillNoticeVisible = false,
    flatName = "Flat 1",
    rooms,
    dachsValues = {
        bh: 111,
        starts: 222,
        electricityInternal: 333,
        heat: 444,
        maintenance: 555,
        buderusBh: 666,
        buderusStarts: 777
    }
}: BuildComponentOptions = {}) {
    vi.resetModules();
    vi.restoreAllMocks();

    const alert = vi.fn();
    vi.stubGlobal("alert", alert);

    const defaultRooms = rooms ?? [
        {id: "r1", name: "Kueche", position: 0, fields: [{id: "f1", name: "Wasser", position: 0}]},
        {id: "r2", name: "Bad", position: 1, fields: [{id: "f2", name: "Strom", position: 0}]}
    ];
    const flat = {
        id: "flat-1",
        name: flatName,
        position: 0,
        rooms: defaultRooms
    };
    const resolvedDachsValues: DachsF233AutofillApiResponseDto | DachsF235AutofillApiResponseDto = defaultRooms[0]?.name === "Dachs F235"
        ? {
            starts: dachsValues.starts ?? 222,
            electricityInternal: dachsValues.electricityInternal ?? 333,
            heat: dachsValues.heat ?? 444,
            maintenance: dachsValues.maintenance ?? 555,
            buderusBh: dachsValues.buderusBh ?? 666
        }
        : {
            bh: dachsValues.bh ?? 111,
            starts: dachsValues.starts ?? 222,
            electricityInternal: dachsValues.electricityInternal ?? 333,
            heat: dachsValues.heat ?? 444,
            maintenance: dachsValues.maintenance ?? 555,
            buderusBh: dachsValues.buderusBh ?? 666,
            buderusStarts: dachsValues.buderusStarts ?? 777
        };

    const dispatch = vi.fn();
    const setFieldValue = vi.fn().mockResolvedValue(undefined);
    const setFieldValues = vi.fn().mockResolvedValue(undefined);
    const deleteFieldValue = vi.fn().mockResolvedValue(undefined);
    const getFieldValues = vi.fn().mockResolvedValue([]);
    const getDachsAutofillValues = vi.fn().mockResolvedValue(resolvedDachsValues);
    const setCurrentDateValue = vi.fn();
    const setCurrentRoom = vi.fn();
    const setAllFieldValues = vi.fn();
    const setCurrentFieldValues = vi.fn();
    const setPendingImportedFieldIds = vi.fn();
    const setIsAutofillNoticeVisible = vi.fn();
    const CustomSelectMock = function CustomSelectMock() {
        return null;
    };
    const FieldInputMock = function FieldInputMock() {
        return null;
    };
    const CustomButtonMock = function CustomButtonMock() {
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
                    return [currentDateValue, setCurrentDateValue] as const;
                }
                if (stateCall === 3) {
                    return [currentFieldValues, setAllFieldValues] as const;
                }
                if (stateCall === 4) {
                    return [currentFieldValues, setCurrentFieldValues] as const;
                }
                if (stateCall === 5) {
                    return [pendingImportedFieldIds, setPendingImportedFieldIds] as const;
                }
                return [isAutofillNoticeVisible, setIsAutofillNoticeVisible] as const;
            }
        };
    });

    vi.doMock("@/store/hooks", () => ({
        useAppDispatch: () => dispatch,
        useAppSelector: () => ({name: currentHouseName})
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
    vi.doMock("@/components/shared/ui/CustomButton", () => ({
        default: CustomButtonMock
    }));
    vi.doMock("@/firebase/functions", () => ({
        getFieldValues,
        setFieldValue,
        setFieldValues,
        deleteFieldValue
    }));
    vi.doMock("@/services/dachsService", () => ({
        getDachsAutofillValues
    }));
    vi.doMock("@/utils/building/fieldValueMapping", async () => {
        const actual = await vi.importActual<typeof import("@/utils/building/fieldValueMapping")>("@/utils/building/fieldValueMapping");
        return {
            ...actual,
            parseYearMonthInput: vi.fn((value: string) => {
                if (value === "2025-11") {
                    return {year: "2025", month: "11"};
                }
                return undefined;
            }),
            filterFieldValuesByRoom: vi.fn(() => currentFieldValues)
        };
    });

    const {default: AddFloorData} = await import("./AddFloorData");
    const element = AddFloorData({flat});

    return {
        alert,
        dispatch,
        element,
        setFieldValue,
        setFieldValues,
        deleteFieldValue,
        getFieldValues,
        getDachsAutofillValues,
        setCurrentDateValue,
        setCurrentRoom,
        setAllFieldValues,
        setCurrentFieldValues,
        setPendingImportedFieldIds,
        setIsAutofillNoticeVisible,
        CustomSelectMock,
        FieldInputMock,
        CustomButtonMock,
        flat
    };
}

describe("AddFloorData logic", () => {
    it("validates numeric field values", () => {
        expect(isFieldValueValid("12")).toBe(true);
        expect(isFieldValueValid("12.5")).toBe(true);
        expect(isFieldValueValid(12)).toBe(true);
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

    it("matches Dachs autofill visibility only for the supported target room", () => {
        const room = {
            id: "room-1",
            name: "Dachs F233",
            position: 0,
            fields: [{id: "field-1", name: "BH", position: 0}]
        };

        expect(shouldShowDachsAutofill(room)).toBe(true);
        expect(shouldShowDachsAutofill({...room, fields: []})).toBe(true);
        expect(shouldShowDachsAutofill({...room, name: "Dachs F235"})).toBe(true);
        expect(shouldShowDachsAutofill({...room, name: "Other Room"})).toBe(false);
    });

    it("maps imported Dachs values without clearing unmatched fields", () => {
        const mapped = mapDachsValuesToFieldValues(
            [
                {field: {id: "1", name: "BH", position: 0}, value: null},
                {field: {id: "2", name: "Strom extern", position: 1}, value: "17"}
            ],
            {
                bh: 123,
                starts: 2,
                electricityInternal: 3,
                heat: 4,
                maintenance: 5,
                buderusBh: 6,
                buderusStarts: 7
            }
        );

        expect(mapped.updatedFieldValues).toEqual([
            {field: {id: "1", name: "BH", position: 0}, value: "123"},
            {field: {id: "2", name: "Strom extern", position: 1}, value: "17"}
        ]);
        expect(mapped.importedFieldValues).toEqual([
            {field: {id: "1", name: "BH", position: 0}, value: "123"}
        ]);
    });

    it("merges current room values back into the cached flat values", () => {
        const merged = mergeRoomFieldValues(
            [
                {field: {id: "1", name: "BH", position: 0}, value: "1"},
                {field: {id: "2", name: "Other", position: 1}, value: "2"}
            ],
            [{field: {id: "1", name: "BH", position: 0}, value: "9"}],
            {id: "room-1", name: "Dachs F233", position: 0, fields: [{id: "1", name: "BH", position: 0}]}
        );

        expect(merged).toEqual([
            {field: {id: "2", name: "Other", position: 1}, value: "2"},
            {field: {id: "1", name: "BH", position: 0}, value: "9"}
        ]);
    });

    it("loads field values and reacts to date, room, save and delete actions", async () => {
        const {
            element,
            setFieldValue,
            deleteFieldValue,
            getFieldValues,
            setCurrentDateValue,
            setCurrentRoom,
            setCurrentFieldValues,
            setAllFieldValues,
            CustomSelectMock,
            FieldInputMock
        } = await buildComponent();

        expect(getFieldValues).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(String),
            expect.objectContaining({id: "flat-1"})
        );

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
        expect(setAllFieldValues).toHaveBeenCalled();

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
            expect.any(String),
            expect.any(String),
            99
        );
        expect(deleteFieldValue).toHaveBeenCalled();
    });

    it("does not persist invalid field values", async () => {
        const {element, setFieldValue, deleteFieldValue} = await buildComponent({
            currentFieldValues: [{field: {id: "f1", name: "Wasser", position: 0}, value: "abc"}]
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
        const {element, alert} = await buildComponent({
            currentFieldValues: [{field: {id: "f1", name: "Wasser", position: 0}, value: "15"}]
        });
        const actionButtons = findElements(element, (currentElement) => {
            const className = currentElement.props?.className;
            return typeof className === "string" && className.includes("actionIconButton");
        });
        await actionButtons[0]?.props?.onClick?.();
        await Promise.resolve();

        expect(alert).toHaveBeenCalledWith(
            de.messages.fieldSaved
                .replace("{valueFieldName}", "Wasser")
                .replace("{valueNumber}", "15")
        );
    });

    it("shows the Dachs import button only in the supported target and saves imported values in batch", async () => {
        const {
            element,
            getDachsAutofillValues,
            setPendingImportedFieldIds,
            setIsAutofillNoticeVisible,
            CustomButtonMock
        } = await buildComponent({
            currentHouseName: "F233",
            flatName: "Haus",
            rooms: [
                {
                    id: "r1",
                    name: "Dachs F233",
                    position: 0,
                    fields: [
                        {id: "f1", name: "BH", position: 0},
                        {id: "f2", name: "Starts", position: 1},
                        {id: "f3", name: "Strom intern", position: 2},
                        {id: "f4", name: "Strom extern", position: 3}
                    ]
                }
            ],
            currentFieldValues: [
                {field: {id: "f1", name: "BH", position: 0}, value: null},
                {field: {id: "f2", name: "Starts", position: 1}, value: null},
                {field: {id: "f3", name: "Strom intern", position: 2}, value: null},
                {field: {id: "f4", name: "Strom extern", position: 3}, value: "17"}
            ],
            dachsValues: {
                bh: 10,
                starts: 20,
                electricityInternal: 30
            }
        });

        const autofillButton = findElement(element, (currentElement) => currentElement.type === CustomButtonMock);
        expect(autofillButton).toBeDefined();

        await autofillButton?.props?.onClick?.();

        expect(getDachsAutofillValues).toHaveBeenCalled();
        expect(setPendingImportedFieldIds).toHaveBeenCalledWith(["f1", "f2", "f3"]);
        expect(setIsAutofillNoticeVisible).toHaveBeenCalledWith(true);
    });

    it("allows Dachs import outside the current month", async () => {
        const {element, alert, getDachsAutofillValues, setFieldValues, CustomButtonMock} = await buildComponent({
            currentHouseName: "F233",
            flatName: "Haus",
            currentDateValue: {year: "2025", month: "01"},
            rooms: [
                {
                    id: "r1",
                    name: "Dachs F233",
                    position: 0,
                    fields: [{id: "f1", name: "BH", position: 0}]
                }
            ],
            currentFieldValues: [{field: {id: "f1", name: "BH", position: 0}, value: null}]
        });

        const autofillButton = findElement(element, (currentElement) => currentElement.type === CustomButtonMock);
        await autofillButton?.props?.onClick?.();

        expect(alert).not.toHaveBeenCalledWith(de.messages.dachsAutofillCurrentMonthOnly);
        expect(getDachsAutofillValues).toHaveBeenCalled();
        expect(setFieldValues).not.toHaveBeenCalled();
    });

    it("supports the F235 Dachs autofill flow with the F235 endpoint data", async () => {
        const {
            element,
            getDachsAutofillValues,
            setCurrentFieldValues,
            setPendingImportedFieldIds,
            setIsAutofillNoticeVisible,
            CustomButtonMock
        } = await buildComponent({
            currentHouseName: "F235",
            flatName: "Haus",
            rooms: [
                {
                    id: "r1",
                    name: "Dachs F235",
                    position: 0,
                    fields: [
                        {id: "f1", name: "Starts", position: 0},
                        {id: "f2", name: "Strom intern", position: 1},
                        {id: "f3", name: "WÃƒÂ¤rme", position: 2},
                        {id: "f4", name: "Wartung", position: 3},
                        {id: "f5", name: "Buderus BH", position: 4}
                    ]
                }
            ],
            currentFieldValues: [
                {field: {id: "f1", name: "Starts", position: 0}, value: null},
                {field: {id: "f2", name: "Strom intern", position: 1}, value: null},
                {field: {id: "f3", name: "WÃƒÂ¤rme", position: 2}, value: null},
                {field: {id: "f4", name: "Wartung", position: 3}, value: null},
                {field: {id: "f5", name: "Buderus BH", position: 4}, value: null}
            ],
            dachsValues: {
                starts: 12,
                electricityInternal: 34,
                heat: 56,
                maintenance: 78,
                buderusBh: 90
            }
        });

        const autofillButton = findElement(element, (currentElement) => currentElement.type === CustomButtonMock);
        expect(autofillButton).toBeDefined();

        await autofillButton?.props?.onClick?.();

        expect(getDachsAutofillValues).toHaveBeenCalledWith("Dachs F235");
        expect(setCurrentFieldValues).toHaveBeenCalledWith([
            {field: {id: "f1", name: "Starts", position: 0}, value: "12"},
            {field: {id: "f2", name: "Strom intern", position: 1}, value: "34"},
            {field: {id: "f3", name: "WÃƒÂ¤rme", position: 2}, value: "56"},
            {field: {id: "f4", name: "Wartung", position: 3}, value: "78"},
            {field: {id: "f5", name: "Buderus BH", position: 4}, value: "90"}
        ]);
        expect(setPendingImportedFieldIds).toHaveBeenCalledWith(["f1", "f2", "f3", "f4", "f5"]);
        expect(setIsAutofillNoticeVisible).toHaveBeenCalledWith(true);
    });

    it("keeps imported values in the form and does not save immediately after import", async () => {
        const {
            element,
            setFieldValues,
            setCurrentFieldValues,
            CustomButtonMock
        } = await buildComponent({
            currentHouseName: "F233",
            flatName: "Haus",
            rooms: [
                {
                    id: "r1",
                    name: "Dachs F233",
                    position: 0,
                    fields: [{id: "f1", name: "BH", position: 0}]
                }
            ],
            currentFieldValues: [{field: {id: "f1", name: "BH", position: 0}, value: null}],
            dachsValues: {bh: 15}
        });

        const autofillButton = findElement(element, (currentElement) => currentElement.type === CustomButtonMock);
        await autofillButton?.props?.onClick?.();

        expect(setCurrentFieldValues).toHaveBeenCalledWith([
            {field: {id: "f1", name: "BH", position: 0}, value: "15"}
        ]);
        expect(setFieldValues).not.toHaveBeenCalled();
    });

    it("renders the autofill notice actions when pending imported values exist", async () => {
        const {element, CustomButtonMock} = await buildComponent({
            isAutofillNoticeVisible: true,
            pendingImportedFieldIds: ["f1"]
        });

        const saveAllButton = findElement(element, (currentElement) =>
            currentElement.type === CustomButtonMock &&
            currentElement.props?.label === de.buttonLabels.saveAllValues);
        const saveLaterButton = findElement(element, (currentElement) =>
            currentElement.type === "button" &&
            currentElement.props?.children === de.buttonLabels.saveLaterIndividually);

        expect(saveAllButton).toBeDefined();
        expect(saveLaterButton).toBeDefined();
    });

    it("saves imported values from the current dialog state via the primary notice action", async () => {
        const {
            element,
            setFieldValues,
            setPendingImportedFieldIds,
            setIsAutofillNoticeVisible,
            CustomButtonMock
        } = await buildComponent({
            currentHouseName: "F233",
            flatName: "Haus",
            isAutofillNoticeVisible: true,
            pendingImportedFieldIds: ["f1", "f2"],
            rooms: [
                {
                    id: "r1",
                    name: "Dachs F233",
                    position: 0,
                    fields: [
                        {id: "f1", name: "BH", position: 0},
                        {id: "f2", name: "Starts", position: 1}
                    ]
                }
            ],
            currentFieldValues: [
                {field: {id: "f1", name: "BH", position: 0}, value: "44"},
                {field: {id: "f2", name: "Starts", position: 1}, value: "55"}
            ]
        });

        const saveAllButton = findElement(element, (currentElement) =>
            currentElement.type === CustomButtonMock &&
            currentElement.props?.label === de.buttonLabels.saveAllValues);
        await saveAllButton?.props?.onClick?.();

        expect(setFieldValues).toHaveBeenCalledWith(
            "F233",
            expect.objectContaining({name: "Haus"}),
            expect.objectContaining({name: "Dachs F233"}),
            expect.any(String),
            expect.any(String),
            [
                {field: {id: "f1", name: "BH", position: 0}, value: 44},
                {field: {id: "f2", name: "Starts", position: 1}, value: 55}
            ]
        );
        expect(setPendingImportedFieldIds).toHaveBeenCalledWith([]);
        expect(setIsAutofillNoticeVisible).toHaveBeenCalledWith(false);
    });

    it("dismisses the notice without saving via the secondary action", async () => {
        const {element, setFieldValues, setIsAutofillNoticeVisible} = await buildComponent({
            isAutofillNoticeVisible: true,
            pendingImportedFieldIds: ["f1"]
        });

        const saveLaterButton = findElement(element, (currentElement) =>
            currentElement.type === "button" &&
            currentElement.props?.children === de.buttonLabels.saveLaterIndividually);
        await saveLaterButton?.props?.onClick?.();

        expect(setFieldValues).not.toHaveBeenCalled();
        expect(setIsAutofillNoticeVisible).toHaveBeenCalledWith(false);
    });
});

