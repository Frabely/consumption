import {describe, expect, it, vi} from "vitest";
import {dispatchChangeDataActions, isChangeCarDataAllowed} from "@/components/features/home/ListItem/ListItem.logic";
import {setDate} from "@/store/reducer/modal/date";
import {setId} from "@/store/reducer/modal/id";
import {setKilometer} from "@/store/reducer/modal/kilometer";
import {setLoadingStation} from "@/store/reducer/modal/loadingStationId";
import {setPower} from "@/store/reducer/modal/power";
import {setModalState} from "@/store/reducer/modalState";
import {ModalState, Role} from "@/constants/enums";

type ReactElementLike = {
    type: unknown;
    props?: {
        children?: unknown;
        onMouseDown?: (...args: unknown[]) => void;
        onMouseUp?: (...args: unknown[]) => void;
        onTouchStart?: (...args: unknown[]) => void;
        onTouchEnd?: (...args: unknown[]) => void;
        className?: string;
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

describe("ListItem logic", () => {
    it("allows change mode only for first element within five minutes", () => {
        const now = new Date("2026-02-18T12:05:00.000Z");
        const recentDate = new Date("2026-02-18T12:02:00.000Z");
        const oldDate = new Date("2026-02-18T11:58:00.000Z");
        const futureDate = new Date("2026-02-18T12:06:00.000Z");

        expect(isChangeCarDataAllowed({isFirstElement: true, dataSetDate: recentDate, currentUserRole: Role.User, now})).toBe(true);
        expect(isChangeCarDataAllowed({isFirstElement: false, dataSetDate: recentDate, currentUserRole: Role.User, now})).toBe(false);
        expect(isChangeCarDataAllowed({isFirstElement: true, dataSetDate: oldDate, currentUserRole: Role.User, now})).toBe(false);
        expect(isChangeCarDataAllowed({isFirstElement: true, dataSetDate: futureDate, currentUserRole: Role.User, now})).toBe(false);
    });

    it("allows admin users to edit older non-first entries", () => {
        const now = new Date("2026-02-18T12:05:00.000Z");
        const oldDate = new Date("2026-02-18T11:00:00.000Z");

        expect(isChangeCarDataAllowed({isFirstElement: false, dataSetDate: oldDate, currentUserRole: Role.Admin, now})).toBe(true);
    });

    it("dispatches all change-data actions in the expected order", () => {
        const dispatch = vi.fn();
        const date = new Date("2026-02-18T12:02:00.000Z");
        const loadingStation = {id: "ls-1", name: "carport"};

        dispatchChangeDataActions({
            dispatch,
            date,
            kilometer: 1234,
            power: 56,
            id: "id-1",
            loadingStation
        });

        expect(dispatch).toHaveBeenNthCalledWith(1, setModalState(ModalState.ChangeCarData));
        expect(dispatch).toHaveBeenNthCalledWith(2, setDate(date));
        expect(dispatch).toHaveBeenNthCalledWith(3, setKilometer("1234"));
        expect(dispatch).toHaveBeenNthCalledWith(4, setPower("56"));
        expect(dispatch).toHaveBeenNthCalledWith(5, setId("id-1"));
        expect(dispatch).toHaveBeenNthCalledWith(6, setLoadingStation(loadingStation));
    });

    it("renders list item values in the component", async () => {
        vi.resetModules();
        vi.doMock("@/store/hooks", () => ({
            useAppDispatch: () => vi.fn(),
            useAppSelector: () => ({role: Role.User})
        }));

        const {createElement} = await import("react");
        const {renderToStaticMarkup} = await import("react-dom/server");
        const {default: ListItem} = await import("./ListItem");

        const html = renderToStaticMarkup(createElement(ListItem, {
            isLight: true,
            date: new Date("2026-02-18T12:00:00.000Z"),
            kilometer: 1234,
            power: 45.6,
            name: "Tester",
            id: "id-1",
            loadingStation: {id: "ls-1", name: "carport"},
            isFirstElement: true
        }));

        expect(html).toContain("Tester");
        expect(html).toContain("1234");
    });

    it("triggers change actions on long press and clears timeout on release", async () => {
        vi.useFakeTimers();
        vi.resetModules();
        const dispatch = vi.fn();
        const dispatchChangeDataActionsMock = vi.fn();
        vi.doMock("@/store/hooks", () => ({
            useAppDispatch: () => dispatch,
            useAppSelector: () => ({role: Role.User})
        }));
        vi.doMock("@/components/features/home/ListItem/ListItem.logic", async () => {
            const actual = await vi.importActual<typeof import("./ListItem.logic")>("./ListItem.logic");
            return {
                ...actual,
                isChangeCarDataAllowed: () => true,
                dispatchChangeDataActions: dispatchChangeDataActionsMock
            };
        });

        const {default: ListItem} = await import("./ListItem");
        const element = ListItem({
            isLight: true,
            date: new Date("2026-02-18T12:00:00.000Z"),
            kilometer: 1234,
            power: 45.6,
            name: "Tester",
            id: "id-1",
            loadingStation: {id: "ls-1", name: "carport"},
            isFirstElement: true
        });
        const root = findElement(element, (currentElement) => typeof currentElement.props?.onMouseDown === "function");
        root?.props?.onMouseDown?.();
        vi.advanceTimersByTime(501);
        expect(dispatch).toHaveBeenCalledWith({type: "isChangingData/setIsChangingData", payload: true});
        expect(dispatchChangeDataActionsMock).toHaveBeenCalled();

        root?.props?.onMouseUp?.();
        root?.props?.onTouchStart?.();
        root?.props?.onTouchEnd?.();
        vi.useRealTimers();
    });

    it("triggers change actions for admin users even on older non-first entries", async () => {
        vi.useFakeTimers();
        vi.resetModules();
        const dispatch = vi.fn();
        const dispatchChangeDataActionsMock = vi.fn();
        const isChangeCarDataAllowedMock = vi.fn().mockReturnValue(true);

        vi.doMock("@/store/hooks", () => ({
            useAppDispatch: () => dispatch,
            useAppSelector: () => ({role: Role.Admin})
        }));
        vi.doMock("@/components/features/home/ListItem/ListItem.logic", async () => {
            const actual = await vi.importActual<typeof import("./ListItem.logic")>("./ListItem.logic");
            return {
                ...actual,
                isChangeCarDataAllowed: isChangeCarDataAllowedMock,
                dispatchChangeDataActions: dispatchChangeDataActionsMock
            };
        });

        const {default: ListItem} = await import("./ListItem");
        const element = ListItem({
            isLight: true,
            date: new Date("2026-02-18T10:00:00.000Z"),
            kilometer: 1234,
            power: 45.6,
            name: "Admin",
            id: "id-2",
            loadingStation: {id: "ls-1", name: "carport"},
            isFirstElement: false
        });
        const root = findElement(element, (currentElement) => typeof currentElement.props?.onMouseDown === "function");

        root?.props?.onMouseDown?.();
        vi.advanceTimersByTime(501);

        expect(isChangeCarDataAllowedMock).toHaveBeenCalledWith({
            isFirstElement: false,
            dataSetDate: new Date("2026-02-18T10:00:00.000Z"),
            currentUserRole: Role.Admin
        });
        expect(dispatchChangeDataActionsMock).toHaveBeenCalled();

        vi.useRealTimers();
    });

});
