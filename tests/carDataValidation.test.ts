import {describe, expect, it} from "vitest";
import {isKilometerValid, isPowerValid, parseIntegerOrNull} from "@/domain/carDataValidation";

describe("carDataValidation", () => {
    it("parses integer values or returns null", () => {
        expect(parseIntegerOrNull("123")).toBe(123);
        expect(parseIntegerOrNull("abc")).toBeNull();
    });

    it("validates power range", () => {
        expect(isPowerValid("0.1")).toBe(true);
        expect(isPowerValid("99.8")).toBe(true);
        expect(isPowerValid("0")).toBe(false);
        expect(isPowerValid("100")).toBe(false);
    });

    it("validates kilometer for add mode", () => {
        expect(isKilometerValid({
            kilometer: "1500",
            isChangingData: false,
            prevKilometers: 0,
            currentCarKilometer: 1499
        })).toBe(true);
        expect(isKilometerValid({
            kilometer: "1499",
            isChangingData: false,
            prevKilometers: 0,
            currentCarKilometer: 1499
        })).toBe(false);
    });

    it("validates kilometer for change mode", () => {
        expect(isKilometerValid({
            kilometer: "1200",
            isChangingData: true,
            prevKilometers: 1100,
            currentCarKilometer: 1500
        })).toBe(true);
        expect(isKilometerValid({
            kilometer: "1000",
            isChangingData: true,
            prevKilometers: 1100,
            currentCarKilometer: 1500
        })).toBe(false);
    });
});
