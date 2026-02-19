import {describe, expect, it, vi} from "vitest";
import {
    calculatePriceToPay,
    getCurrentYearMonth,
    isPriceMultiplierValid,
    summarizeConsumptionDocs
} from "@/components/features/home/Statistics/Statistics.logic";

type ReactElementLike = {
    type: unknown;
    props?: {
        children?: unknown;
        onChange?: (...args: unknown[]) => void;
        type?: string;
        [key: string]: unknown;
    };
};

function isElementLike(node: unknown): node is ReactElementLike {
    return Boolean(node) && typeof node === "object" && "type" in (node as object);
}

function findElements(node: unknown, predicate: (element: ReactElementLike) => boolean): ReactElementLike[] {
    if (!node) {
        return [];
    }
    if (Array.isArray(node)) {
        return node.flatMap((child) => findElements(child, predicate));
    }
    if (!isElementLike(node)) {
        return [];
    }
    const own = predicate(node) ? [node] : [];
    return [...own, ...findElements(node.props?.children, predicate)];
}

describe("Statistics logic", () => {
    it("returns current year-month with zero-padded month", () => {
        expect(getCurrentYearMonth(new Date("2026-02-18T10:00:00.000Z"))).toEqual({
            year: "2026",
            month: "02"
        });
        expect(getCurrentYearMonth(new Date("2026-11-01T10:00:00.000Z"))).toEqual({
            year: "2026",
            month: "11"
        });
    });

    it("validates price multiplier boundaries", () => {
        expect(isPriceMultiplierValid("0.1")).toBe(true);
        expect(isPriceMultiplierValid("0,3")).toBe(true);
        expect(isPriceMultiplierValid("99.99")).toBe(true);
        expect(isPriceMultiplierValid("0")).toBe(false);
        expect(isPriceMultiplierValid("100")).toBe(false);
        expect(isPriceMultiplierValid("abc")).toBe(false);
    });

    it("calculates price and supports comma decimal separator", () => {
        expect(calculatePriceToPay(10, "0.2")).toBe(2);
        expect(calculatePriceToPay(10, "0,3")).toBe(3);
        expect(calculatePriceToPay(10, "invalid")).toBe(10);
    });

    it("summarizes consumption docs and handles empty input", () => {
        const docs = [
            {data: {power: "10.5", kilometer: 100}},
            {data: {power: 9.5, kilometer: 150}}
        ];

        expect(summarizeConsumptionDocs(docs)).toEqual({
            kwhFueled: 20,
            kilometersDriven: 50
        });
        expect(summarizeConsumptionDocs([])).toEqual({
            kwhFueled: 0,
            kilometersDriven: 0
        });
    });

    it("renders selected car and kpi cards", async () => {
        vi.resetModules();
        vi.doMock("@/store/hooks", () => ({
            useAppSelector: () => "Zoe"
        }));

        const {createElement} = await import("react");
        const {renderToStaticMarkup} = await import("react-dom/server");
        const {default: Statistics} = await import("./Statistics");

        const html = renderToStaticMarkup(createElement(Statistics));

        expect(html).toContain("Zoe");
        expect(html).toContain("kWh");
    });

    it("loads consumption data and applies input handlers", async () => {
        vi.resetModules();
        const setKilometersDriven = vi.fn();
        const setKwhFueled = vi.fn();
        const setPriceMultiplier = vi.fn();
        const setPriceToPay = vi.fn();
        const setFromDateValue = vi.fn();
        const setToDateValue = vi.fn();
        const loadAllConsumptionDocsBetween = vi.fn().mockResolvedValue([
            {data: {power: "10", kilometer: 100}},
            {data: {power: "5", kilometer: 130}}
        ]);

        vi.doMock("react", async () => {
            const actual = await vi.importActual<typeof import("react")>("react");
            let stateCall = 0;
            return {
                ...actual,
                useEffect: (callback: () => void) => callback(),
                useState: () => {
                    stateCall += 1;
                    if (stateCall === 1) {
                        return [0, setKilometersDriven] as const;
                    }
                    if (stateCall === 2) {
                        return [0, setKwhFueled] as const;
                    }
                    if (stateCall === 3) {
                        return ["0.2", setPriceMultiplier] as const;
                    }
                    if (stateCall === 4) {
                        return [0, setPriceToPay] as const;
                    }
                    if (stateCall === 5) {
                        return [{year: "2026", month: "02"}, setFromDateValue] as const;
                    }
                    return [{year: "2026", month: "02"}, setToDateValue] as const;
                }
            };
        });
        vi.doMock("@/store/hooks", () => ({
            useAppSelector: () => "Zoe"
        }));
        vi.doMock("@/firebase/functions", () => ({
            loadAllConsumptionDocsBetween
        }));
        vi.doMock("@/utils/building/fieldValueMapping", async () => {
            const actual = await vi.importActual<typeof import("@/utils/building/fieldValueMapping")>("@/utils/building/fieldValueMapping");
            return {
                ...actual,
                parseYearMonthInput: vi.fn((value: string) => value === "2025-12" ? {year: "2025", month: "12"} : undefined)
            };
        });
        vi.doMock("@/components/features/home/Statistics/Statistics.logic", async () => {
            const actual = await vi.importActual<typeof import("./Statistics.logic")>("./Statistics.logic");
            return {
                ...actual,
                getCurrentYearMonth: () => ({year: "2026", month: "02"}),
                calculatePriceToPay: vi.fn(() => 123),
                summarizeConsumptionDocs: vi.fn(() => ({kwhFueled: 15, kilometersDriven: 30}))
            };
        });

        const {default: Statistics} = await import("./Statistics");
        const element = Statistics({});
        await Promise.resolve();

        expect(loadAllConsumptionDocsBetween).toHaveBeenCalledWith(
            {year: "2026", month: "02"},
            {year: "2026", month: "02"},
            "Zoe"
        );
        expect(setKwhFueled).toHaveBeenCalledWith(15);
        expect(setKilometersDriven).toHaveBeenCalledWith(30);
        expect(setPriceToPay).toHaveBeenCalledWith(123);

        const monthInputs = findElements(element, (currentElement) => currentElement.type === "input" && currentElement.props?.type === "month");
        monthInputs[0]?.props?.onChange?.({target: {value: "2025-12"}});
        monthInputs[1]?.props?.onChange?.({target: {value: "2025-12"}});
        expect(setFromDateValue).toHaveBeenCalledWith({year: "2025", month: "12"});
        expect(setToDateValue).toHaveBeenCalledWith({year: "2025", month: "12"});

        const numberInput = findElements(element, (currentElement) => currentElement.type === "input" && currentElement.props?.type === "number")[0];
        numberInput?.props?.onChange?.({target: {value: "0.3"}});
        expect(setPriceMultiplier).toHaveBeenCalledWith("0.3");
    });
});

