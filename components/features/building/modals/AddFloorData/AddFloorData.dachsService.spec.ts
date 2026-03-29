import {beforeEach, describe, expect, it, vi} from "vitest";

describe("AddFloorData dachs service", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("normalizes camelCase electricityInternal from the API response", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({
                bh: 1,
                starts: 2,
                electricityInternal: 281133.719
            })
        }));

        const {getDachsAutofillValues} = await import("./AddFloorData.dachsService");
        const result = await getDachsAutofillValues();

        expect(result.electricityInternal).toBe(281133.719);
    });
});
