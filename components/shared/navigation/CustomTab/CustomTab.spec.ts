import {describe, expect, it, vi} from "vitest";

describe("CustomTab component", () => {
    it("renders tabs and marks selected tab", async () => {
        const {createElement} = await import("react");
        const {renderToStaticMarkup} = await import("react-dom/server");
        const {default: CustomTab} = await import("./CustomTab");

        const html = renderToStaticMarkup(createElement(CustomTab, {
            tabNames: ["Eintraege", "Statistik"],
            selected: 1,
            setSelected: vi.fn()
        }));

        expect(html).toContain("Statistik");
        expect(html).toContain("aria-selected=\"true\"");
    });
});
