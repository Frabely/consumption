import { describe, expect, it, vi } from "vitest";
import { ModalState, Role } from "@/constants/enums";
import {
  canAccessBuildingConsumption,
  resolveBackLabel,
  resolveCurrentHouseByName,
  resolveFloorModalState,
} from "@/components/features/building/pages/BuildingConsumption/BuildingConsumption.logic";

type ReactElementLike = {
  type: unknown;
  props?: {
    children?: unknown;
    onMouseDown?: (...args: unknown[]) => void;
    onMouseUp?: (...args: unknown[]) => void;
    onAddFloor?: (...args: unknown[]) => void;
    [key: string]: unknown;
  };
};

function isElementLike(node: unknown): node is ReactElementLike {
  return (
    Boolean(node) && typeof node === "object" && "type" in (node as object)
  );
}

function findElement(
  node: unknown,
  predicate: (element: ReactElementLike) => boolean,
): ReactElementLike | undefined {
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

describe("BuildingConsumption logic", () => {
  it("checks access based on key and admin role", () => {
    expect(canAccessBuildingConsumption("1234", Role.Admin)).toBe(true);
    expect(canAccessBuildingConsumption(undefined, Role.Admin)).toBe(false);
    expect(canAccessBuildingConsumption("1234", Role.User)).toBe(false);
  });

  it("resolves floor modal state for short vs long press", () => {
    expect(resolveFloorModalState(true)).toBe(ModalState.ChangeFloorFields);
    expect(resolveFloorModalState(false)).toBe(ModalState.AddFloorData);
  });

  it("resolves back label by login state", () => {
    expect(
      resolveBackLabel("1234", { back: "Back", backToLogin: "BackToLogin" }),
    ).toBe("BackToLogin");
    expect(
      resolveBackLabel(undefined, { back: "Back", backToLogin: "BackToLogin" }),
    ).toBe("Back");
  });

  it("resolves selected house by name", () => {
    const houses = [
      { id: "1", name: "H1", flats: [] },
      { id: "2", name: "H2", flats: [] },
    ];

    expect(resolveCurrentHouseByName(houses, "H2")).toEqual({
      id: "2",
      name: "H2",
      flats: [],
    });
    expect(resolveCurrentHouseByName(houses, "Unknown")).toBeUndefined();
  });

  it("renders back button when user has no building access", async () => {
    vi.resetModules();
    vi.doMock("@/store/hooks", () => {
      const values = [
        { name: "H1", flats: [] },
        {},
        false,
        ModalState.None,
        { isReloadHousesNeeded: false },
      ];
      return {
        useAppDispatch: () => vi.fn(),
        useAppSelector: () => values.shift(),
      };
    });

    const { createElement } = await import("react");
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { default: BuildingConsumption } =
      await import("./BuildingConsumption");

    const html = renderToStaticMarkup(createElement(BuildingConsumption));

    expect(html).toContain("button");
  });

  it("handles reload flow, add floor action and short floor press", async () => {
    vi.resetModules();
    const dispatch = vi.fn();
    const setCurrentFlat = vi.fn();
    const setIsLongTouchTriggered = vi.fn();
    const setHouseNames = vi.fn();
    const loadHouses = vi.fn().mockResolvedValue([
      {
        id: "house-1",
        name: "House A",
        flats: [{ id: "flat-1", name: "Floor 1", position: 0, rooms: [] }],
      },
    ]);
    const MenuBuildingMock = function MenuBuildingMock() {
      return null;
    };

    vi.doMock("react", async () => {
      const actual = await vi.importActual<typeof import("react")>("react");
      let stateCall = 0;
      const timerRef = { current: undefined as unknown };
      return {
        ...actual,
        useRef: () => timerRef,
        useEffect: (callback: () => void) => callback(),
        useState: () => {
          stateCall += 1;
          if (stateCall === 1) {
            return [undefined, setCurrentFlat] as const;
          }
          if (stateCall === 2) {
            return [false, setIsLongTouchTriggered] as const;
          }
          return [[], setHouseNames] as const;
        },
      };
    });
    vi.doMock("@/store/hooks", () => {
      const values = [
        {
          name: "House A",
          flats: [{ id: "flat-1", name: "Floor 1", position: 0, rooms: [] }],
        },
        { key: "1", role: Role.Admin },
        false,
        ModalState.None,
        { isReloadHousesNeeded: true },
      ];
      return {
        useAppDispatch: () => dispatch,
        useAppSelector: () => values.shift(),
      };
    });
    vi.doMock("@/constants/constantData", () => ({
      loadHouses,
    }));
    vi.doMock("@/components/shared/overlay/Modal", () => ({
      default: function ModalMock() {
        return null;
      },
    }));
    vi.doMock("@/components/features/building/MenuBuilding", () => ({
      default: MenuBuildingMock,
    }));
    vi.doMock(
      "@/components/features/building/pages/BuildingConsumption/BuildingConsumption.logic",
      async () => {
        const actual = await vi.importActual<
          typeof import("./BuildingConsumption.logic")
        >("./BuildingConsumption.logic");
        return {
          ...actual,
          canAccessBuildingConsumption: () => true,
          resolveFloorModalState: (isLongPress: boolean) =>
            isLongPress
              ? ModalState.ChangeFloorFields
              : ModalState.AddFloorData,
        };
      },
    );
    vi.doMock("@/store/reducer/isLoading", () => ({
      setIsLoading: (payload: boolean) => ({ type: "setIsLoading", payload }),
    }));
    vi.doMock("@/store/reducer/isReloadDataNeeded", () => ({
      setIsReloadHousesNeeded: (payload: boolean) => ({
        type: "setIsReloadHousesNeeded",
        payload,
      }),
    }));
    vi.doMock("@/store/reducer/currentHouse", () => ({
      setCurrentHouse: (payload: unknown) => ({
        type: "setCurrentHouse",
        payload,
      }),
    }));
    vi.doMock("@/store/reducer/modalState", () => ({
      setModalState: (payload: ModalState) => ({
        type: "setModalState",
        payload,
      }),
    }));

    const { default: BuildingConsumptionComponent } =
      await import("./BuildingConsumption");
    const BuildingConsumption =
      BuildingConsumptionComponent as unknown as (props: {}) => unknown;
    const element = BuildingConsumption({});
    await Promise.resolve();

    expect(loadHouses).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      type: "setIsLoading",
      payload: true,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: "setIsReloadHousesNeeded",
      payload: false,
    });
    expect(setHouseNames).toHaveBeenCalled();

    const menu = findElement(
      element,
      (currentElement) => currentElement.type === MenuBuildingMock,
    );
    menu?.props?.onAddFloor?.();
    expect(dispatch).toHaveBeenCalledWith({
      type: "setModalState",
      payload: ModalState.AddFloor,
    });

    const floor = findElement(element, (currentElement) => {
      const className = currentElement.props?.className;
      return typeof className === "string" && className.includes("flatsItem");
    });
    floor?.props?.onMouseDown?.();
    floor?.props?.onMouseUp?.();
    expect(setCurrentFlat).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Floor 1" }),
    );
    expect(dispatch).toHaveBeenCalledWith({
      type: "setModalState",
      payload: ModalState.AddFloorData,
    });
  });
});
