import {describe, expect, it, vi} from "vitest";
import de from "@/constants/de.json";
import {
    buildLoadingText,
    LOADING_VISIBILITY_DELAY_MS
} from "@/components/features/home/Loading/Loading.logic";

describe("Loading logic", () => {
    it("builds loading text from language labels", () => {
        expect(buildLoadingText(de)).toBe(`${de.displayLabels.loading}...`);
    });

    it("uses a 200ms spinner visibility delay", () => {
        expect(LOADING_VISIBILITY_DELAY_MS).toBe(200);
    });
});
