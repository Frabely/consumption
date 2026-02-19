import { beforeEach, describe, expect, it, vi } from "vitest";
import { cars } from "@/constants/constantData";
import { CarNames, Role } from "@/constants/enums";
import { User } from "@/constants/types";
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
    expect(dispatch).toHaveBeenNthCalledWith(2, setCurrentUser(user));
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
    expect(dispatch).toHaveBeenNthCalledWith(1, setCurrentUser(user));
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

  it("does not persist session when auth-session rollout is disabled", async () => {
    const dispatch = vi.fn();
    const user: User = {
      key: "1234",
      name: "Test",
      role: Role.User,
      defaultCar: CarNames.BMW,
    };
    const checkUserIdFn = vi.fn().mockResolvedValue(user);
    const buildPersistedAuthSessionFn = vi.fn();
    const persistAuthSessionFn = vi.fn();
    const emitTelemetryEvent = vi.fn();

    const result = await handleLoginInput({
      input: "1234",
      dispatch,
      checkUserIdFn,
      buildPersistedAuthSessionFn,
      persistAuthSessionFn,
      isSessionRolloutEnabledFn: () => false,
      emitTelemetryEvent,
    });

    expect(buildPersistedAuthSessionFn).not.toHaveBeenCalled();
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
});
