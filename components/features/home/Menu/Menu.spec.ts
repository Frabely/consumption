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

    it("renders action labels for admin users", async () => {
        vi.resetModules();
        vi.doMock("@/store/hooks", () => {
            const values = [Role.Admin, "Zoe"];
            return {
                useAppDispatch: () => vi.fn(),
                useAppSelector: () => values.shift()
            };
        });
        vi.doMock("@/components/shared/navigation/ActionMenu", () => ({
            default: ({actions}: {actions: Array<{id: string}>}) => actions.map((action) => action.id).join("|")
        }));

        const {createElement} = await import("react");
        const {renderToStaticMarkup} = await import("react-dom/server");
        const {default: Menu} = await import("./Menu");

        const html = renderToStaticMarkup(createElement(Menu));

        expect(html).toContain("logout");
        expect(html).toContain("downloadCsv");
        expect(html).toContain("buildingConsumption");
    });
});
