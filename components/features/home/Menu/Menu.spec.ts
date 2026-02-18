import {describe, expect, it, vi} from "vitest";
import {Role} from "@/constants/enums";
import {
    buildHomeMenuActions,
    resolveDefaultCarName,
    resolveSelectedCar
} from "@/components/features/home/Menu/Menu.logic";

describe("Menu logic", () => {
    const labels = {
        logout: "Logout",
        downloadCsv: "CSV",
        buildingConsumption: "Building"
    };

    it("builds base actions for non-admin users", () => {
        const actions = buildHomeMenuActions({
            role: Role.User,
            labels,
            onLogout: vi.fn(),
            onExportCsv: vi.fn(),
            onBuildingConsumption: vi.fn()
        });

        expect(actions.map((action) => action.id)).toEqual(["logout", "downloadCsv"]);
    });

    it("adds building action for admin users", () => {
        const actions = buildHomeMenuActions({
            role: Role.Admin,
            labels,
            onLogout: vi.fn(),
            onExportCsv: vi.fn(),
            onBuildingConsumption: vi.fn()
        });

        expect(actions.map((action) => action.id)).toEqual([
            "logout",
            "downloadCsv",
            "buildingConsumption"
        ]);
    });

    it("resolves selected/default car names", () => {
        const cars = [{name: "Zoe"}, {name: "BMW"}];

        expect(resolveSelectedCar(cars, "BMW")).toEqual({name: "BMW"});
        expect(resolveSelectedCar(cars, "Unknown")).toBeUndefined();
        expect(resolveDefaultCarName("BMW", cars)).toBe("BMW");
        expect(resolveDefaultCarName(undefined, cars)).toBe("Zoe");
        expect(resolveDefaultCarName(undefined, [])).toBe("");
    });
});
