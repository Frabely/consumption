import {describe, expect, it} from "vitest";
import {ModalState, Role} from "@/constants/enums";
import {
    canAccessBuildingConsumption,
    resolveBackLabel,
    resolveCurrentHouseByName,
    resolveFloorModalState
} from "@/components/features/building/pages/BuildingConsumption/BuildingConsumption.logic";

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
        expect(resolveBackLabel("1234", {back: "Back", backToLogin: "BackToLogin"})).toBe("BackToLogin");
        expect(resolveBackLabel(undefined, {back: "Back", backToLogin: "BackToLogin"})).toBe("Back");
    });

    it("resolves selected house by name", () => {
        const houses = [
            {id: "1", name: "H1", flats: []},
            {id: "2", name: "H2", flats: []}
        ];

        expect(resolveCurrentHouseByName(houses, "H2")).toEqual({id: "2", name: "H2", flats: []});
        expect(resolveCurrentHouseByName(houses, "Unknown")).toBeUndefined();
    });
});
