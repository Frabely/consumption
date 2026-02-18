import {describe, expect, it} from "vitest";
import {
    calculatePriceToPay,
    getCurrentYearMonth,
    isPriceMultiplierValid,
    summarizeConsumptionDocs
} from "@/components/Statistics/Statistics.logic";

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
        expect(isPriceMultiplierValid("99.99")).toBe(true);
        expect(isPriceMultiplierValid("0")).toBe(false);
        expect(isPriceMultiplierValid("100")).toBe(false);
        expect(isPriceMultiplierValid("abc")).toBe(false);
    });

    it("calculates price and falls back to 1 for invalid multiplier inputs", () => {
        expect(calculatePriceToPay(10, "0.2")).toBe(2);
        expect(calculatePriceToPay(10, "0,3")).toBe(10);
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
});
