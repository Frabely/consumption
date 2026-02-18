import {describe, expect, it} from "vitest";
import de from "@/constants/de.json";
import {buildLoadingText} from "@/components/features/home/Loading/Loading.logic";

describe("Loading logic", () => {
    it("builds loading text from language labels", () => {
        expect(buildLoadingText(de)).toBe(`${de.displayLabels.loading}...`);
    });
});
