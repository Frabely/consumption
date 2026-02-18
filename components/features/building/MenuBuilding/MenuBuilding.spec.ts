import {describe, expect, it, vi} from "vitest";
import {
    buildBuildingMenuActions,
    resolveDefaultHouseName,
    resolveSelectedHouse
} from "@/components/features/building/MenuBuilding/MenuBuilding.logic";

describe("MenuBuilding logic", () => {
    const labels = {
        home: "Home",
        logout: "Logout",
        downloadCsv: "CSV"
    };

    it("builds expected actions", () => {
        const actions = buildBuildingMenuActions({
            labels,
            onHome: vi.fn(),
            onLogout: vi.fn(),
            onExportCsv: vi.fn()
        });

        expect(actions.map((action) => action.id)).toEqual([
            "home",
            "logout",
            "downloadBuildingCsv"
        ]);
    });

    it("resolves selected/default house names", () => {
        const houses = [
            {id: "h1", name: "H1", flats: []},
            {id: "h2", name: "H2", flats: []}
        ];

        expect(resolveSelectedHouse(houses, "H2")).toEqual({id: "h2", name: "H2", flats: []});
        expect(resolveSelectedHouse(houses, "Unknown")).toBeUndefined();
        expect(resolveDefaultHouseName("H2", houses)).toBe("H2");
        expect(resolveDefaultHouseName(undefined, houses)).toBe("H1");
        expect(resolveDefaultHouseName(undefined, [])).toBe("");
    });

    it("renders building menu actions in component", async () => {
        vi.resetModules();
        vi.doMock("@/store/hooks", () => ({
            useAppDispatch: () => vi.fn(),
            useAppSelector: () => "Haus 1"
        }));
        vi.doMock("@/components/shared/navigation/ActionMenu", () => ({
            default: ({actions}: {actions: Array<{id: string}>}) => actions.map((action) => action.id).join("|")
        }));

        const {createElement} = await import("react");
        const {renderToStaticMarkup} = await import("react-dom/server");
        const {default: MenuBuilding} = await import("./MenuBuilding");

        const html = renderToStaticMarkup(createElement(MenuBuilding, {
            houses: [{id: "1", name: "Haus 1", flats: []}],
            onAddFloor: vi.fn()
        }));

        expect(html).toContain("home");
        expect(html).toContain("logout");
        expect(html).toContain("downloadBuildingCsv");
    });
});
