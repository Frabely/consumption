import {describe, expect, it, vi} from "vitest";
import {ModalState} from "@/constants/enums";

const TEST_LOADING_STATIONS = [
    {id: "station-1", name: "carport"},
    {id: "station-2", name: "garage"}
];
const TEST_DEFAULT_LOADING_STATION = TEST_LOADING_STATIONS[0];

type SelectorState = {
    modalState: ModalState;
    currentCar: { name: string; kilometer: number; prevKilometer: number };
    currentUser: { name: string };
    kilometer: string;
    power: string;
    loadingStation: { id: string; name: string };
    id: string;
    date: Date;
    changingData: boolean;
};

type ReactElementLike = {
    type: unknown;
    props?: {
        children?: unknown;
        onClick?: () => void;
        onChange?: (...args: unknown[]) => void;
        disabled?: boolean;
        [key: string]: unknown;
    };
};

const createAction = (type: string) => (payload?: unknown) => ({type, payload});

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
    const ownMatch = predicate(node) ? [node] : [];
    return [...ownMatch, ...findElements(node.props?.children, predicate)];
}

async function buildComponent({
    selectorOverrides = {},
    effectMode = "skip",
    isKilometerValidValue = true,
    isPowerValidValue = true
}: {
    selectorOverrides?: Partial<SelectorState>;
    effectMode?: "skip" | "run";
    isKilometerValidValue?: boolean;
    isPowerValidValue?: boolean;
} = {}) {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.stubGlobal("alert", vi.fn());

    const dispatch = vi.fn();
    const addDataSetToCollection = vi.fn();
    const changeDataSetInCollection = vi.fn();
    const updateCarKilometer = vi.fn().mockResolvedValue(undefined);
    const isKilometerValid = vi.fn().mockReturnValue(isKilometerValidValue);
    const isPowerValid = vi.fn().mockReturnValue(isPowerValidValue);
    const parseIntegerOrNull = vi.fn((value: string) => {
        if (!value) {
            return null;
        }
        return Number.parseInt(value, 10);
    });
    const setIsInputValid = vi.fn();
    const setDisabled = vi.fn();
    const useEffect = vi.fn((callback: () => void) => {
        if (effectMode === "run") {
            callback();
        }
    });
    const CustomSelectMock = function CustomSelectMock() {
        return null;
    };

    vi.doMock("react", async () => {
        const actual = await vi.importActual<typeof import("react")>("react");
        let useStateCalls = 0;
        return {
            ...actual,
            useEffect,
            useState: (initialValue: unknown) => {
                useStateCalls += 1;
                if (useStateCalls === 1) {
                    return [initialValue, setIsInputValid] as const;
                }
                return [true, setDisabled] as const;
            }
        };
    });

    const selectorState: SelectorState = {
        modalState: ModalState.AddCarData,
        currentCar: {name: "Zoe", kilometer: 100, prevKilometer: 90},
        currentUser: {name: "Tester"},
        kilometer: "120",
        power: "12.5",
        loadingStation: TEST_LOADING_STATIONS[0],
        id: "id-1",
        date: new Date("2026-02-18T10:00:00.000Z"),
        changingData: false,
        ...selectorOverrides
    };

    vi.doMock("@/store/hooks", () => {
        const values: unknown[] = [
            selectorState.modalState,
            selectorState.currentCar,
            selectorState.currentUser,
            selectorState.kilometer,
            selectorState.power,
            selectorState.loadingStation,
            selectorState.id,
            selectorState.date,
            selectorState.changingData
        ];
        return {
            useAppDispatch: () => dispatch,
            useAppSelector: () => values.shift()
        };
    });

    vi.doMock("@/components/shared/overlay/Modal", () => ({
        default: function ModalMock() {
            return null;
        }
    }));
    vi.doMock("@/components/shared/forms/CustomSelect", () => ({
        default: CustomSelectMock
    }));
    vi.doMock("@/firebase/functions", () => ({
        addDataSetToCollection,
        changeDataSetInCollection,
        updateCarKilometer
    }));
    vi.doMock("@/constants/constantData", () => ({
        DEFAULT_LOADING_STATION: TEST_DEFAULT_LOADING_STATION,
        loadingStations: TEST_LOADING_STATIONS
    }));
    vi.doMock("@/utils/validation/carDataValidation", () => ({
        isKilometerValid,
        isPowerValid,
        parseIntegerOrNull
    }));
    vi.doMock("@/store/reducer/modalState", () => ({setModalStateNone: createAction("setModalStateNone")}));
    vi.doMock("@/store/reducer/modal/kilometer", () => ({setKilometer: createAction("setKilometer")}));
    vi.doMock("@/store/reducer/modal/power", () => ({setPower: createAction("setPower")}));
    vi.doMock("@/store/reducer/isChangingData", () => ({setIsChangingData: createAction("setIsChangingData")}));
    vi.doMock("@/store/reducer/modal/loadingStationId", () => ({setLoadingStation: createAction("setLoadingStation")}));
    vi.doMock("@/store/reducer/currentCar", () => ({
        updateCarKilometers: createAction("updateCarKilometers"),
        updateCarPrevKilometers: createAction("updateCarPrevKilometers")
    }));
    vi.doMock("@/store/reducer/modal/date", () => ({setDate: createAction("setDate")}));

    const {default: AddData} = await import("./AddData");
    const element = AddData({prevKilometers: 90});

    return {
        element,
        dispatch,
        addDataSetToCollection,
        changeDataSetInCollection,
        updateCarKilometer,
        isKilometerValid,
        isPowerValid,
        parseIntegerOrNull,
        setIsInputValid,
        setDisabled,
        useEffect,
        CustomSelectMock
    };
}

describe("AddData component", () => {
    it("regression: re-opened add modal keeps default values but resets validity", async () => {
        const {setIsInputValid} = await buildComponent({
            effectMode: "run",
            selectorOverrides: {
                kilometer: "100",
                power: "",
                changingData: false
            },
            isKilometerValidValue: true,
            isPowerValidValue: true
        });

        expect(setIsInputValid).toHaveBeenCalledWith({kilometer: false, power: false});
    });

    it("resets modal state via effect when AddCarData modal is active", async () => {
        const {dispatch, useEffect, setIsInputValid} = await buildComponent({effectMode: "run"});

        expect(useEffect).toHaveBeenCalledTimes(3);
        expect(dispatch).toHaveBeenCalledWith({type: "setPower", payload: ""});
        expect(dispatch).toHaveBeenCalledWith({type: "setKilometer", payload: "100"});
        expect(dispatch).toHaveBeenCalledWith({type: "setIsChangingData", payload: false});
        expect(dispatch).toHaveBeenCalledWith({type: "setLoadingStation", payload: TEST_DEFAULT_LOADING_STATION});
        expect(setIsInputValid).toHaveBeenCalledWith({kilometer: false, power: false});
    });

    it("submits new data when add mode is valid", async () => {
        const {
            element,
            dispatch,
            addDataSetToCollection,
            updateCarKilometer,
            parseIntegerOrNull,
            setIsInputValid
        } = await buildComponent();

        const button = findElement(element, (currentElement) => currentElement.type === "button");
        button?.props?.onClick?.();

        expect(parseIntegerOrNull).toHaveBeenCalledWith("120");
        expect(addDataSetToCollection).toHaveBeenCalledTimes(1);
        expect(addDataSetToCollection).toHaveBeenCalledWith(
            "Zoe",
            expect.objectContaining({
                kilometer: 120,
                power: 12.5,
                name: "Tester",
                loadingStation: TEST_LOADING_STATIONS[0],
                date: expect.any(Date)
            })
        );
        expect(updateCarKilometer).toHaveBeenCalledWith("Zoe", 120, 100);
        expect(dispatch).toHaveBeenCalledWith({type: "updateCarPrevKilometers", payload: 100});
        expect(dispatch).toHaveBeenCalledWith({type: "updateCarKilometers", payload: 120});
        expect(dispatch).toHaveBeenCalledWith({type: "setModalStateNone", payload: undefined});
        expect(setIsInputValid).toHaveBeenCalledWith({kilometer: false, power: false});
    });

    it("shows alert when add mode contains invalid data", async () => {
        const {element, addDataSetToCollection, updateCarKilometer} = await buildComponent({
            selectorOverrides: {kilometer: "99"}
        });

        const button = findElement(element, (currentElement) => currentElement.type === "button");
        button?.props?.onClick?.();

        expect(globalThis.alert).toHaveBeenCalledWith("Invalid Data");
        expect(addDataSetToCollection).not.toHaveBeenCalled();
        expect(updateCarKilometer).not.toHaveBeenCalled();
    });

    it("submits changed data in change mode", async () => {
        const {
            element,
            changeDataSetInCollection,
            updateCarKilometer,
            dispatch
        } = await buildComponent({
            selectorOverrides: {changingData: true, kilometer: "121"}
        });

        const button = findElement(element, (currentElement) => currentElement.type === "button");
        button?.props?.onClick?.();

        expect(changeDataSetInCollection).toHaveBeenCalledWith(
            "Zoe",
            new Date("2026-02-18T10:00:00.000Z"),
            12.5,
            121,
            TEST_LOADING_STATIONS[0],
            "id-1"
        );
        expect(updateCarKilometer).toHaveBeenCalledWith("Zoe", 121);
        expect(dispatch).toHaveBeenCalledWith({type: "updateCarKilometers", payload: 121});
    });

    it("handles input and loading station handlers", async () => {
        const {
            element,
            dispatch,
            isKilometerValid,
            isPowerValid,
            setIsInputValid,
            CustomSelectMock
        } = await buildComponent();

        const inputs = findElements(element, (currentElement) => currentElement.type === "input");

        const kilometerInput = inputs[0];
        const powerInput = inputs[1];
        const customSelect = findElement(element, (currentElement) => currentElement.type === CustomSelectMock);

        kilometerInput?.props?.onChange?.({target: {value: "140"}});
        expect(isKilometerValid).toHaveBeenCalled();
        expect(dispatch).toHaveBeenCalledWith({type: "setKilometer", payload: "140"});
        expect(setIsInputValid).toHaveBeenCalledWith(expect.objectContaining({kilometer: true}));

        powerInput?.props?.onChange?.({target: {value: "22.2"}});
        expect(isPowerValid).toHaveBeenCalledWith("22.2");
        expect(dispatch).toHaveBeenCalledWith({type: "setPower", payload: "22.2"});
        expect(setIsInputValid).toHaveBeenCalledWith(expect.objectContaining({power: true}));

        customSelect?.props?.onChange?.("Garage", TEST_LOADING_STATIONS[1].id);
        expect(dispatch).toHaveBeenCalledWith({type: "setLoadingStation", payload: TEST_LOADING_STATIONS[1]});

        const callCountBeforeNoKey = dispatch.mock.calls.length;
        customSelect?.props?.onChange?.("Garage");
        expect(dispatch.mock.calls.length).toBe(callCountBeforeNoKey);
    });
});

