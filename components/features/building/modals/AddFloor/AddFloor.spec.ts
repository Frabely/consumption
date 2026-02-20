import { describe, expect, it, vi } from "vitest";
import {
  canAddFieldByName,
  canAddRoomByName,
} from "@/components/features/building/modals/AddFloor/AddFloor.logic";
import de from "@/i18n";
import { ModalState } from "@/constants/enums";

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

function findElements(
  node: unknown,
  predicate: (element: ReactElementLike) => boolean,
): ReactElementLike[] {
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
  modalState = ModalState.AddFloor,
  currentFlat,
  roomNameInput = "",
  fieldNameInput = "",
  currentSelectedRoom,
  canAddRoom = false,
  canAddField = false,
  createFlatRejects = false,
  updateFlatRejects = false,
  confirmResult = true,
}: {
  modalState?: ModalState;
  currentFlat?: {
    id: string;
    name: string;
    position: number;
    rooms: Array<{
      id: string;
      name: string;
      position: number;
      fields: Array<{ id: string; name: string; position: number }>;
    }>;
  };
  roomNameInput?: string;
  fieldNameInput?: string;
  currentSelectedRoom?:
    | {
        id: string;
        name: string;
        position: number;
        fields: Array<{ id: string; name: string; position: number }>;
      }
    | undefined;
  canAddRoom?: boolean;
  canAddField?: boolean;
  createFlatRejects?: boolean;
  updateFlatRejects?: boolean;
  confirmResult?: boolean;
} = {}) {
  vi.resetModules();
  vi.restoreAllMocks();
  vi.stubGlobal("alert", vi.fn());
  const confirm = vi.fn(() => confirmResult);
  vi.stubGlobal("window", { confirm });

  const dispatch = vi.fn();
  const createFlat = createFlatRejects
    ? vi.fn().mockRejectedValue(new Error("create failed"))
    : vi.fn().mockResolvedValue(undefined);
  const updateFlat = updateFlatRejects
    ? vi.fn().mockRejectedValue(new Error("update failed"))
    : vi.fn().mockResolvedValue(undefined);
  const canAddRoomByName = vi.fn(() => canAddRoom);
  const canAddFieldByName = vi.fn(() => canAddField);
  const CustomButtonMock = function CustomButtonMock() {
    return null;
  };
  const setFlatName = vi.fn();
  const setRoomNameInput = vi.fn();
  const setRooms = vi.fn();
  const setFieldNameInput = vi.fn();
  const setCurrentSelectedRoom = vi.fn();
  vi.doMock("react", async () => {
    const actual = await vi.importActual<typeof import("react")>("react");
    const flatName = currentFlat?.name ?? "";
    const rooms = currentFlat?.rooms ?? [];
    const selectedRoom = currentSelectedRoom ?? currentFlat?.rooms?.[0];
    let stateCall = 0;
    return {
      ...actual,
      useState: () => {
        stateCall += 1;
        if (stateCall === 1) {
          return [flatName, setFlatName] as const;
        }
        if (stateCall === 2) {
          return [roomNameInput, setRoomNameInput] as const;
        }
        if (stateCall === 3) {
          return [rooms, setRooms] as const;
        }
        if (stateCall === 4) {
          return [fieldNameInput, setFieldNameInput] as const;
        }
        return [selectedRoom, setCurrentSelectedRoom] as const;
      },
    };
  });

  vi.doMock("@/store/hooks", () => {
    const values = [{ name: "House 1", flats: [] }, modalState];
    return {
      useAppDispatch: () => dispatch,
      useAppSelector: () => values.shift(),
    };
  });
  vi.doMock("@/components/shared/overlay/Modal", () => ({
    default: function ModalMock() {
      return null;
    },
  }));
  vi.doMock("@/components/shared/ui/CustomButton", () => ({
    default: CustomButtonMock,
  }));
  vi.doMock("@/firebase/functions", () => ({
    createFlat,
    updateFlat,
  }));
  vi.doMock(
    "@/components/features/building/modals/AddFloor/AddFloor.logic",
    () => ({
      canAddRoomByName,
      canAddFieldByName,
    }),
  );
  vi.doMock("@/store/reducer/modalState", () => ({
    setModalStateNone: () => ({ type: "setModalStateNone" }),
  }));
  vi.doMock("@/store/reducer/isLoading", () => ({
    setIsLoading: (payload: boolean) => ({ type: "setIsLoading", payload }),
  }));
  vi.doMock("@/store/reducer/isReloadDataNeeded", () => ({
    setIsReloadHousesNeeded: (payload: boolean) => ({
      type: "setIsReloadHousesNeeded",
      payload,
    }),
  }));

  const { default: AddFloorComponent } = await import("./AddFloor");
  const AddFloor = AddFloorComponent as unknown as (props: {
    currentFlat?: {
      id: string;
      name: string;
      position: number;
      rooms: Array<{
        id: string;
        name: string;
        position: number;
        fields: Array<{ id: string; name: string; position: number }>;
      }>;
    };
    newFlatPosition: number;
  }) => unknown;
  const element = AddFloor({ currentFlat, newFlatPosition: 2 });

  return {
    element,
    dispatch,
    createFlat,
    updateFlat,
    CustomButtonMock,
    setRooms,
    setCurrentSelectedRoom,
    setRoomNameInput,
    confirm,
  };
}

describe("AddFloor logic", () => {
  it("validates room names for add action", () => {
    const rooms = [{ id: "1", name: "Kueche", fields: [] }];

    expect(canAddRoomByName("Bad", rooms)).toBe(true);
    expect(canAddRoomByName("Kueche", rooms)).toBe(false);
    expect(canAddRoomByName("", rooms)).toBe(false);
  });

  it("validates field names for selected room", () => {
    const room = {
      id: "1",
      name: "Bad",
      fields: [{ id: "f1", name: "Wasser" }],
    };

    expect(canAddFieldByName("Strom", room)).toBe(true);
    expect(canAddFieldByName("Wasser", room)).toBe(false);
    expect(canAddFieldByName("", room)).toBe(false);
    expect(canAddFieldByName("Strom", undefined)).toBe(false);
  });

  it("creates a flat in add mode and dispatches completion actions", async () => {
    const { element, createFlat, dispatch, CustomButtonMock } =
      await buildComponent({
        modalState: ModalState.AddFloor,
        currentFlat: undefined,
      });

    const saveButton = findElement(
      element,
      (currentElement) => currentElement.type === CustomButtonMock,
    );
    const event = { preventDefault: vi.fn() };
    await saveButton?.props?.onClick?.(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(createFlat).toHaveBeenCalledWith(
      expect.objectContaining({ name: "", rooms: [], position: 2 }),
      "House 1",
    );
    expect(dispatch).toHaveBeenCalledWith({ type: "setModalStateNone" });
    expect(dispatch).toHaveBeenCalledWith({
      type: "setIsReloadHousesNeeded",
      payload: true,
    });
  });

  it("updates existing flat in change mode", async () => {
    const currentFlat = {
      id: "flat-1",
      name: "Flat A",
      position: 1,
      rooms: [{ id: "room-1", name: "Kitchen", position: 0, fields: [] }],
    };
    const { element, updateFlat, CustomButtonMock } = await buildComponent({
      modalState: ModalState.ChangeFloorFields,
      currentFlat,
    });

    const saveButton = findElement(
      element,
      (currentElement) => currentElement.type === CustomButtonMock,
    );
    await saveButton?.props?.onClick?.({ preventDefault: vi.fn() });

    expect(updateFlat).toHaveBeenCalledWith(
      "House 1",
      expect.objectContaining({ id: "flat-1", name: "Flat A", position: 1 }),
    );
  });

  it("shows database error message when save fails", async () => {
    const { element, CustomButtonMock } = await buildComponent({
      modalState: ModalState.AddFloor,
      createFlatRejects: true,
    });
    const saveButton = findElement(
      element,
      (currentElement) => currentElement.type === CustomButtonMock,
    );
    await saveButton?.props?.onClick?.({ preventDefault: vi.fn() });

    expect(globalThis.alert).toHaveBeenCalledWith(de.messages.databaseError);
  });

  it("prevents field add when no room is selected", async () => {
    const { element } = await buildComponent({
      currentSelectedRoom: undefined,
      canAddField: true,
    });

    const addButtons = findElements(element, (currentElement) => {
      const className = currentElement.props?.className;
      return (
        typeof className === "string" && className.includes("addIconButton")
      );
    });

    const addFieldButton = addButtons[1];
    addFieldButton?.props?.onClick?.({ preventDefault: vi.fn() });

    expect(globalThis.alert).toHaveBeenCalledWith(de.messages.selectARoom);
  });

  it("adds room when room input is valid and add-room is enabled", async () => {
    const { element, setRooms, setCurrentSelectedRoom, setRoomNameInput } =
      await buildComponent({
        roomNameInput: "Office",
        canAddRoom: true,
      });

    const addButtons = findElements(element, (currentElement) => {
      const className = currentElement.props?.className;
      return (
        typeof className === "string" && className.includes("addIconButton")
      );
    });

    addButtons[0]?.props?.onClick?.({ preventDefault: vi.fn() });
    expect(setRooms).toHaveBeenCalledWith([
      { id: "", name: "Office", fields: [], position: 0 },
    ]);
    expect(setCurrentSelectedRoom).toHaveBeenCalledWith({
      id: "",
      name: "Office",
      fields: [],
      position: 0,
    });
    expect(setRoomNameInput).toHaveBeenCalledWith("");
  });

  it("reorders rooms when arrow controls are used", async () => {
    const currentFlat = {
      id: "flat-1",
      name: "Flat A",
      position: 1,
      rooms: [
        { id: "room-1", name: "Kitchen", position: 0, fields: [] },
        { id: "room-2", name: "Living", position: 1, fields: [] },
      ],
    };
    const { element, setRooms } = await buildComponent({ currentFlat });
    const arrowButtons = findElements(element, (currentElement) => {
      const className = currentElement.props?.className;
      return typeof className === "string" && className.includes("arrowButton");
    });

    arrowButtons[0]?.props?.onClick?.();
    expect(setRooms).toHaveBeenCalledWith([
      { id: "room-2", name: "Living", position: 0, fields: [] },
      { id: "room-1", name: "Kitchen", position: 1, fields: [] },
    ]);
  });

  it("removes selected room only after confirmation", async () => {
    const currentFlat = {
      id: "flat-1",
      name: "Flat A",
      position: 1,
      rooms: [
        { id: "room-1", name: "Kitchen", position: 0, fields: [] },
        { id: "room-2", name: "Living", position: 1, fields: [] },
      ],
    };

    const confirmed = await buildComponent({
      currentFlat,
      confirmResult: true,
    });
    const deleteButtonsConfirmed = findElements(
      confirmed.element,
      (currentElement) => {
        const className = currentElement.props?.className;
        return (
          typeof className === "string" && className.includes("deleteButton")
        );
      },
    );
    deleteButtonsConfirmed[0]?.props?.onClick?.();
    expect(confirmed.confirm).toHaveBeenCalled();
    expect(confirmed.setRooms).toHaveBeenCalledWith([
      { id: "room-2", name: "Living", position: 0, fields: [] },
    ]);
    expect(confirmed.setCurrentSelectedRoom).toHaveBeenCalledWith(undefined);

    const declined = await buildComponent({
      currentFlat,
      confirmResult: false,
    });
    const deleteButtonsDeclined = findElements(
      declined.element,
      (currentElement) => {
        const className = currentElement.props?.className;
        return (
          typeof className === "string" && className.includes("deleteButton")
        );
      },
    );
    deleteButtonsDeclined[0]?.props?.onClick?.();
    expect(declined.confirm).toHaveBeenCalled();
    expect(declined.setRooms).not.toHaveBeenCalled();
  });

  it("updates room name via room input change", async () => {
    const currentFlat = {
      id: "flat-1",
      name: "Flat A",
      position: 1,
      rooms: [{ id: "room-1", name: "Kitchen", position: 0, fields: [] }],
    };
    const { element, setRooms, setCurrentSelectedRoom } = await buildComponent({
      currentFlat,
    });
    const roomInputs = findElements(element, (currentElement) => {
      const className = currentElement.props?.className;
      return typeof className === "string" && className.includes("roomInput");
    });

    roomInputs[0]?.props?.onChange?.({ target: { value: "Office" } });
    expect(setRooms).toHaveBeenCalledWith([
      { id: "room-1", name: "Office", position: 0, fields: [] },
    ]);
    expect(setCurrentSelectedRoom).toHaveBeenCalledWith({
      id: "room-1",
      name: "Office",
      position: 0,
      fields: [],
    });
  });
});

