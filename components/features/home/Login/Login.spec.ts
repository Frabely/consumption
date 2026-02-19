import {beforeEach, describe, expect, it, vi} from "vitest";
import {cars} from "@/constants/constantData";
import {CarNames} from "@/constants/enums";
import {User} from "@/constants/types";
import {handleLoginInput, isCompleteLoginInput, resolveLoginCar} from "@/components/features/home/Login/Login.logic";
import {setCurrentCar} from "@/store/reducer/currentCar";
import {setCurrentUser} from "@/store/reducer/currentUser";

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
        const zoe = {name: CarNames.Zoe, kilometer: 10, prevKilometer: 9};
        const bmw = {name: CarNames.BMW, kilometer: 20, prevKilometer: 19};
        const availableCars = [zoe, bmw];

        const userWithDefault: User = {defaultCar: CarNames.BMW};
        const userWithoutDefault: User = {defaultCar: "Unknown"};

        expect(resolveLoginCar(userWithDefault, availableCars)).toEqual(bmw);
        expect(resolveLoginCar(userWithoutDefault, availableCars)).toEqual(zoe);
    });

    it("does not run user lookup before input is complete", async () => {
        const dispatch = vi.fn();
        const checkUserIdFn = vi.fn();

        await handleLoginInput({input: "12", dispatch, checkUserIdFn});

        expect(checkUserIdFn).not.toHaveBeenCalled();
        expect(dispatch).not.toHaveBeenCalled();
    });

    it("dispatches current car and user when lookup succeeds", async () => {
        const zoe = {name: CarNames.Zoe, kilometer: 10, prevKilometer: 9};
        const bmw = {name: CarNames.BMW, kilometer: 20, prevKilometer: 19};
        cars.splice(0, cars.length, zoe, bmw);

        const user: User = {key: "1234", name: "Test", defaultCar: CarNames.BMW};
        const dispatch = vi.fn();
        const checkUserIdFn = vi.fn().mockResolvedValue(user);

        await handleLoginInput({input: "1234", dispatch, checkUserIdFn});

        expect(checkUserIdFn).toHaveBeenCalledWith("1234");
        expect(dispatch).toHaveBeenNthCalledWith(1, setCurrentCar(bmw));
        expect(dispatch).toHaveBeenNthCalledWith(2, setCurrentUser(user));
    });

    it("dispatches only user when no matching car is available", async () => {
        cars.splice(0, cars.length);

        const user: User = {key: "1234", name: "Test", defaultCar: CarNames.BMW};
        const dispatch = vi.fn();
        const checkUserIdFn = vi.fn().mockResolvedValue(user);

        await handleLoginInput({input: "1234", dispatch, checkUserIdFn});

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenNthCalledWith(1, setCurrentUser(user));
    });

    it("renders login component with password input", async () => {
        vi.resetModules();
        vi.doMock("@/store/hooks", () => ({
            useAppDispatch: () => vi.fn()
        }));

        const {createElement} = await import("react");
        const {renderToStaticMarkup} = await import("react-dom/server");
        const {default: Login} = await import("./Login");

        const html = renderToStaticMarkup(createElement(Login));

        expect(html).toContain('type="password"');
        expect(html).toContain("Passwort anzeigen");
    });
});
