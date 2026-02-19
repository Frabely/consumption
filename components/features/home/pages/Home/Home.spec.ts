import {describe, expect, it, vi} from "vitest";
import {ModalState} from "@/constants/enums";
import {
    isAddDataModalOpen,
    isDownloadCsvModalOpen,
    isEvaluationTabSelected,
    resolveHydratedCurrentCar,
    resolvePrevKilometers
} from "@/components/features/home/pages/Home/Home.logic";

describe("Home logic", () => {
    it("detects selected evaluation tab", () => {
        expect(isEvaluationTabSelected(1)).toBe(true);
        expect(isEvaluationTabSelected(0)).toBe(false);
    });

    it("detects open modals", () => {
        expect(isAddDataModalOpen(ModalState.AddCarData)).toBe(true);
        expect(isAddDataModalOpen(ModalState.ChangeCarData)).toBe(true);
        expect(isAddDataModalOpen(ModalState.DownloadCsv)).toBe(false);

        expect(isDownloadCsvModalOpen(ModalState.DownloadCsv)).toBe(true);
        expect(isDownloadCsvModalOpen(ModalState.None)).toBe(false);
    });

    it("resolves previous kilometers fallback", () => {
        expect(resolvePrevKilometers(123)).toBe(123);
        expect(resolvePrevKilometers(undefined)).toBe(0);
    });

    it("hydrates current car by selected car name", () => {
        const resolvedCar = resolveHydratedCurrentCar({
            carsList: [
                {name: "A", kilometer: 10, prevKilometer: 5},
                {name: "B", kilometer: 20, prevKilometer: 15}
            ],
            currentCarName: "B",
            defaultCarName: "A"
        });

        expect(resolvedCar).toEqual({name: "B", kilometer: 20, prevKilometer: 15});
    });

    it("hydrates current car by default car when selected name is unavailable", () => {
        const resolvedCar = resolveHydratedCurrentCar({
            carsList: [
                {name: "A", kilometer: 10, prevKilometer: 5},
                {name: "B", kilometer: 20, prevKilometer: 15}
            ],
            currentCarName: "Missing",
            defaultCarName: "A"
        });

        expect(resolvedCar).toEqual({name: "A", kilometer: 10, prevKilometer: 5});
    });

    it("hydrates current car with first available fallback", () => {
        const resolvedCar = resolveHydratedCurrentCar({
            carsList: [
                {name: "A", kilometer: 10, prevKilometer: 5},
                {name: "B", kilometer: 20, prevKilometer: 15}
            ],
            currentCarName: "Missing",
            defaultCarName: "AlsoMissing"
        });

        expect(resolvedCar).toEqual({name: "A", kilometer: 10, prevKilometer: 5});
    });

    it("renders login view when no user is active", async () => {
        vi.resetModules();
        vi.doMock("@/store/hooks", () => {
            const values = [
                false,
                {},
                ModalState.None,
                {prevKilometer: 0}
            ];
            return {
                useAppDispatch: () => vi.fn(),
                useAppSelector: () => values.shift()
            };
        });
        vi.doMock("@/components/features/home/Login", () => ({default: () => "LOGIN_VIEW"}));

        const {createElement} = await import("react");
        const {renderToStaticMarkup} = await import("react-dom/server");
        const {default: Home} = await import("./Home");

        const html = renderToStaticMarkup(createElement(Home));

        expect(html).toContain("LOGIN_VIEW");
    });
});
