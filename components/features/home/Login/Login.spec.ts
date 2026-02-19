import { beforeEach, describe, expect, it, vi } from "vitest";
import { cars } from "@/constants/constantData";
import { CarNames, Role } from "@/constants/enums";
import { User } from "@/constants/types";
import {
  handleLoginInput,
  isCompleteLoginInput,
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

    await handleLoginInput({ input: "12", dispatch, checkUserIdFn });

    expect(checkUserIdFn).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
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

    await handleLoginInput({
      input: "1234",
      dispatch,
      checkUserIdFn,
      persistAuthSessionFn,
    });

    expect(checkUserIdFn).toHaveBeenCalledWith("1234");
    expect(dispatch).toHaveBeenNthCalledWith(1, setCurrentCar(bmw));
    expect(dispatch).toHaveBeenNthCalledWith(2, setCurrentUser(user));
    expect(dispatch).toHaveBeenNthCalledWith(3, setAuthStatusAuthenticated());
    expect(persistAuthSessionFn).toHaveBeenCalledTimes(1);
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

    await handleLoginInput({
      input: "1234",
      dispatch,
      checkUserIdFn,
      persistAuthSessionFn,
    });

    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenNthCalledWith(1, setCurrentUser(user));
    expect(dispatch).toHaveBeenNthCalledWith(2, setAuthStatusAuthenticated());
    expect(persistAuthSessionFn).toHaveBeenCalledTimes(1);
  });

  it("does not persist session if build function returns null", async () => {
    const dispatch = vi.fn();
    const user: User = { key: "1234", name: "Test", defaultCar: CarNames.BMW };
    const checkUserIdFn = vi.fn().mockResolvedValue(user);
    const buildPersistedAuthSessionFn = vi.fn().mockReturnValue(null);
    const persistAuthSessionFn = vi.fn();

    await handleLoginInput({
      input: "1234",
      dispatch,
      checkUserIdFn,
      buildPersistedAuthSessionFn,
      persistAuthSessionFn,
    });

    expect(persistAuthSessionFn).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(setAuthStatusAuthenticated());
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
    expect(html).toContain("Passwort anzeigen");
  });
});
