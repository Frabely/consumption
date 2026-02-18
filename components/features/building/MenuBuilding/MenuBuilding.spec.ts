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
});
