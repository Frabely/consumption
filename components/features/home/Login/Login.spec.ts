import { beforeEach, describe, expect, it, vi } from "vitest";
import { cars } from "@/constants/constantData";
import { CarNames, Role } from "@/constants/enums";
import { User } from "@/constants/types";
import de from "@/constants/de.json";
import {
  appendPinCharacter,
  handleLoginInput,
  isCompleteLoginInput,
  removeLastPinCharacter,
  resolveActivePinSlotIndex,
  resolveLoginCar,
} from "@/components/features/home/Login/Login.logic";
import { setCurrentCar } from "@/store/reducer/currentCar";
import { setCurrentUser } from "@/store/reducer/currentUser";
import { setAuthStatusAuthenticated } from "@/store/reducer/authStatus";

type ElementLike = {
  type: unknown;
  props?: Record<string, unknown> & { children?: unknown };
};

const isElementLike = (node: unknown): node is ElementLike =>
  Boolean(node) && typeof node === "object" && "type" in (node as object);

const findElement = (
  node: unknown,
  predicate: (element: ElementLike) => boolean,
): ElementLike | undefined => {
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
};

describe("login", () => {
  const initialCars = [...cars];

  beforeEach(() => {
    cars.splice(0, cars.length, ...initialCars);
  });

  it("considers input complete only when four chars are entered", () => {
    expect(isCompleteLoginInput("123")).toBe(false);
    expect(isCompleteLoginInput("1234")).toBe(true);
  });

  it("resolves active slot index to first free or last when full", () => {
    expect(resolveActivePinSlotIndex("")).toBe(0);
    expect(resolveActivePinSlotIndex("a")).toBe(1);
    expect(resolveActivePinSlotIndex("ab")).toBe(2);
    expect(resolveActivePinSlotIndex("abc")).toBe(3);
    expect(resolveActivePinSlotIndex("abcd")).toBe(3);
  });

  it("appends and removes pin characters from end", () => {
    expect(appendPinCharacter("", "a")).toBe("a");
    expect(appendPinCharacter("abc", "!")).toBe("abc!");
    expect(appendPinCharacter("abcd", "x")).toBe("abcd");
    expect(removeLastPinCharacter("abcd")).toBe("abc");
    expect(removeLastPinCharacter("a")).toBe("");
    expect(removeLastPinCharacter("")).toBe("");
  });

  it("resolves the first matching login car and falls back to Zoe", () => {
    const zoe = { name: CarNames.Zoe, kilometer: 10, prevKilometer: 9 };
    const bmw = { name: CarNames.BMW, kilometer: 20, prevKilometer: 19 };
    const availableCars = [zoe, bmw];

    const userWithDefault: User = { defaultCar: CarNames.BMW };
    const userWithoutDefault: User = { defaultCar: "Unknown" };

    expect(resolveLoginCar(userWithDefault, availableCars)).toEqual(bmw);
    expect(resolveLoginCar(userWithoutDefault, availableCars)).toEqual(zoe);
  });

  it("does not run user lookup before input is complete", async () => {
    const dispatch = vi.fn();
    const checkUserIdFn = vi.fn();

    const result = await handleLoginInput({
      input: "12",
      dispatch,
      checkUserIdFn,
    });

    expect(checkUserIdFn).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
    expect(result.status).toBe("incomplete");
  });

  it("accepts letters and special chars and authenticates at length four", async () => {
    const dispatch = vi.fn();
    const checkUserIdFn = vi.fn().mockResolvedValue(undefined);
    const emitTelemetryEvent = vi.fn();

    const result = await handleLoginInput({
      input: "a$B!",
      dispatch,
      checkUserIdFn,
      emitTelemetryEvent,
    });

    expect(checkUserIdFn).toHaveBeenCalledWith("a$B!");
    expect(result.status).toBe("rejected");
  });

  it("dispatches current car and user when lookup succeeds", async () => {
    const zoe = { name: CarNames.Zoe, kilometer: 10, prevKilometer: 9 };
    const bmw = { name: CarNames.BMW, kilometer: 20, prevKilometer: 19 };
    cars.splice(0, cars.length, zoe, bmw);

    const user: User = {
      key: "1234",
      name: "Test",
      role: Role.User,
      defaultCar: CarNames.BMW,
    };
    const dispatch = vi.fn();
    const checkUserIdFn = vi.fn().mockResolvedValue(user);
    const persistAuthSessionFn = vi.fn();
    const emitTelemetryEvent = vi.fn();

    const result = await handleLoginInput({
      input: "1234",
      dispatch,
      checkUserIdFn,
      persistAuthSessionFn,
      emitTelemetryEvent,
    });

    expect(checkUserIdFn).toHaveBeenCalledWith("1234");
    expect(dispatch).toHaveBeenNthCalledWith(1, setCurrentCar(bmw));
    expect(dispatch).toHaveBeenNthCalledWith(
      2,
      setCurrentUser({ ...user, defaultCar: CarNames.BMW }),
    );
    expect(dispatch).toHaveBeenNthCalledWith(3, setAuthStatusAuthenticated());
    expect(persistAuthSessionFn).toHaveBeenCalledTimes(1);
    expect(emitTelemetryEvent).toHaveBeenCalledTimes(1);
    expect(result.status).toBe("success");
  });

  it("dispatches only user when no matching car is available", async () => {
    cars.splice(0, cars.length);

    const user: User = {
      key: "1234",
      name: "Test",
      role: Role.User,
      defaultCar: CarNames.BMW,
    };
    const dispatch = vi.fn();
    const checkUserIdFn = vi.fn().mockResolvedValue(user);
    const persistAuthSessionFn = vi.fn();
    const emitTelemetryEvent = vi.fn();

    const result = await handleLoginInput({
      input: "1234",
      dispatch,
      checkUserIdFn,
      persistAuthSessionFn,
      emitTelemetryEvent,
    });

    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenNthCalledWith(
      1,
      setCurrentUser({ ...user, defaultCar: CarNames.BMW }),
    );
    expect(dispatch).toHaveBeenNthCalledWith(2, setAuthStatusAuthenticated());
    expect(persistAuthSessionFn).toHaveBeenCalledTimes(1);
    expect(emitTelemetryEvent).toHaveBeenCalledTimes(1);
    expect(result.status).toBe("success");
  });

  it("does not persist session if build function returns null", async () => {
    const dispatch = vi.fn();
    const user: User = { key: "1234", name: "Test", defaultCar: CarNames.BMW };
    const checkUserIdFn = vi.fn().mockResolvedValue(user);
    const buildPersistedAuthSessionFn = vi.fn().mockReturnValue(null);
    const persistAuthSessionFn = vi.fn();
    const emitTelemetryEvent = vi.fn();

    const result = await handleLoginInput({
      input: "1234",
      dispatch,
      checkUserIdFn,
      buildPersistedAuthSessionFn,
      persistAuthSessionFn,
      emitTelemetryEvent,
    });

    expect(persistAuthSessionFn).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(setAuthStatusAuthenticated());
    expect(emitTelemetryEvent).toHaveBeenCalledTimes(1);
    expect(result.status).toBe("success");
  });

  it("emits rejected telemetry when user lookup returns no user", async () => {
    const dispatch = vi.fn();
    const checkUserIdFn = vi.fn().mockResolvedValue(undefined);
    const emitTelemetryEvent = vi.fn();

    const result = await handleLoginInput({
      input: "1234",
      dispatch,
      checkUserIdFn,
      emitTelemetryEvent,
    });

    expect(dispatch).not.toHaveBeenCalled();
    expect(emitTelemetryEvent).toHaveBeenCalledTimes(1);
    expect(result.status).toBe("rejected");
  });

  it("returns unavailable when user lookup throws", async () => {
    const dispatch = vi.fn();
    const checkUserIdFn = vi.fn().mockRejectedValue(new Error("offline"));
    const emitTelemetryEvent = vi.fn();

    const result = await handleLoginInput({
      input: "1234",
      dispatch,
      checkUserIdFn,
      emitTelemetryEvent,
    });

    expect(dispatch).not.toHaveBeenCalled();
    expect(emitTelemetryEvent).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ status: "unavailable", message: "offline" });
  });

  it("renders login component with password input", async () => {
    vi.resetModules();
    vi.doMock("@/store/hooks", () => ({
      useAppDispatch: () => vi.fn(),
    }));

    const { createElement } = await import("react");
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { default: Login } = await import("./Login");

    const html = renderToStaticMarkup(createElement(Login));

    expect(html).toContain('type="password"');
    expect(html).toContain("PIN anzeigen");
    expect(html).toContain("Login");
  });

  it("renders rejected and unavailable status messages", async () => {
    vi.resetModules();
    const useStateRejected = vi
      .fn()
      .mockReturnValueOnce([false, vi.fn()])
      .mockReturnValueOnce(["", vi.fn()])
      .mockReturnValueOnce([{ status: "rejected" }, vi.fn()]);
    vi.doMock("react", async () => {
      const actual = await vi.importActual<typeof import("react")>("react");
      return {
        ...actual,
        useState: useStateRejected,
        useEffect: vi.fn(),
      };
    });
    vi.doMock("@/store/hooks", () => ({
      useAppDispatch: () => vi.fn(),
    }));

    const { createElement } = await import("react");
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { default: LoginRejected } = await import("./Login");
    const rejectedHtml = renderToStaticMarkup(createElement(LoginRejected));
    expect(rejectedHtml).toContain(de.messages.loginRejected);

    vi.resetModules();
    const useStateUnavailable = vi
      .fn()
      .mockReturnValueOnce([false, vi.fn()])
      .mockReturnValueOnce(["", vi.fn()])
      .mockReturnValueOnce([{ status: "unavailable", message: "offline" }, vi.fn()]);
    vi.doMock("react", async () => {
      const actual = await vi.importActual<typeof import("react")>("react");
      return {
        ...actual,
        useState: useStateUnavailable,
        useEffect: vi.fn(),
      };
    });
    vi.doMock("@/store/hooks", () => ({
      useAppDispatch: () => vi.fn(),
    }));

    const { default: LoginUnavailable } = await import("./Login");
    const unavailableHtml = renderToStaticMarkup(createElement(LoginUnavailable));
    expect(unavailableHtml).toContain(de.messages.loginUnavailable);
  });

  it("handles visibility toggle, backspace, and slot-focus interactions", async () => {
    vi.resetModules();
    const setIsPasswordVisible = vi.fn();
    const setPinInput = vi.fn();
    const setLoginResult = vi.fn();
    const focus = vi.fn();
    const setSelectionRange = vi.fn();
    const inputRef = { current: { value: "1234", focus, setSelectionRange } };

    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((callback: (time: number) => void) => {
        callback(0);
        return 1;
      }),
    );

    const useStateMock = vi
      .fn()
      .mockReturnValueOnce([false, setIsPasswordVisible])
      .mockReturnValueOnce(["1234", setPinInput])
      .mockReturnValueOnce([{ status: "incomplete" }, setLoginResult]);

    const noopUseCallback = <T extends (...args: never[]) => unknown>(callback: T): T =>
      callback;
    const noopUseMemo = <T>(factory: () => T): T => factory();
    vi.doMock("react", async () => {
      const actual = await vi.importActual<typeof import("react")>("react");
      return {
        ...actual,
        useState: useStateMock,
        useRef: vi.fn(() => inputRef),
        useEffect: vi.fn(),
        useCallback: noopUseCallback,
        useMemo: noopUseMemo,
      };
    });
    vi.doMock("@/store/hooks", () => ({
      useAppDispatch: () => vi.fn(),
    }));

    const { default: Login } = await import("./Login");
    const tree = Login({});

    const pinSlotsButton = findElement(
      tree,
      (element) => element.type === "button" && element.props?.["aria-label"] === de.messages.loginSlotsAriaLabel,
    );
    (pinSlotsButton?.props?.onClick as (() => void) | undefined)?.();
    expect(focus).toHaveBeenCalled();
    expect(setSelectionRange).toHaveBeenCalled();

    const visibilityButton = findElement(
      tree,
      (element) =>
        element.type === "button" &&
        typeof element.props?.["aria-pressed"] === "boolean",
    );
    (visibilityButton?.props?.onClick as (() => void) | undefined)?.();
    expect(setIsPasswordVisible).toHaveBeenCalledWith(true);

    const passwordInput = findElement(
      tree,
      (element) => element.type === "input" && element.props?.name === "password",
    );
    const preventDefault = vi.fn();
    await (
      passwordInput?.props?.onKeyDown as
        | ((event: { key: string; preventDefault: () => void }) => Promise<void>)
        | undefined
    )?.({
      key: "Backspace",
      preventDefault,
    });
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(setPinInput).toHaveBeenCalledWith("123");
    expect(setLoginResult).toHaveBeenCalledWith({ status: "incomplete" });
  });
});
