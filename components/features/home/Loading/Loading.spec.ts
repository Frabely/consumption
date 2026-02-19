import {describe, expect, it, vi} from "vitest";
import de from "@/constants/de.json";
import {buildLoadingText} from "@/components/features/home/Loading/Loading.logic";

describe("Loading logic", () => {
    it("builds loading text from language labels", () => {
        expect(buildLoadingText(de)).toBe(`${de.displayLabels.loading}...`);
    });

    it("renders loading text in the component", async () => {
        vi.resetModules();

        const {createElement} = await import("react");
        const {renderToStaticMarkup} = await import("react-dom/server");
        const {default: Loading} = await import("./Loading");

        const html = renderToStaticMarkup(createElement(Loading));

        expect(html).toContain(`${de.displayLabels.loading}...`);
    });
});
