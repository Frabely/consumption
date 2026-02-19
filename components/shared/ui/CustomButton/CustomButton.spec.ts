import {describe, expect, it, vi} from "vitest";

describe("CustomButton component", () => {
    it("renders label and disabled attribute", async () => {
        const {createElement} = await import("react");
        const {renderToStaticMarkup} = await import("react-dom/server");
        const {default: CustomButton} = await import("./CustomButton");

        const html = renderToStaticMarkup(createElement(CustomButton, {
            label: "Speichern",
            disabled: true,
            onClick: vi.fn()
        }));

        expect(html).toContain("Speichern");
        expect(html).toContain("disabled");
    });
});
