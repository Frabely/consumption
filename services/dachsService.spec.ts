import {beforeEach, describe, expect, it, vi} from "vitest";

describe("AddFloorData dachs service", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("resolves the F233 endpoint and normalizes camelCase electricityInternal from the API response", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({
                bh: 1,
                starts: 2,
                electricityInternal: 281133.719,
                heat: 4,
                maintenance: 5,
                buderusBh: 6,
                buderusStarts: 7
            })
        }));

        const {getDachsAutofillValues} = await import("./dachsService");
        const result = await getDachsAutofillValues("F233");

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/dachs/f233/status"),
            expect.objectContaining({cache: "no-store"})
        );
        expect(result.electricityInternal).toBe(281133.719);
    });

    it("resolves the F235 endpoint and omits fields that the response does not provide", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({
                starts: 3,
                electricityInternal: 41.5,
                heat: 5,
                maintenance: 7,
                buderusBh: 11
            })
        }));

        const {getDachsAutofillValues} = await import("./dachsService");

        const result = await getDachsAutofillValues("F235");

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/dachs/f235/status"),
            expect.objectContaining({cache: "no-store"})
        );
        expect(result).toEqual({
            starts: 3,
            electricityInternal: 41.5,
            heat: 5,
            maintenance: 7,
            buderusBh: 11
        });
        expect(result).not.toHaveProperty("bh");
        expect(result).not.toHaveProperty("buderusStarts");
    });
});
