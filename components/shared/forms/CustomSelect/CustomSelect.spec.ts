import {describe, expect, it} from "vitest";

describe("CustomSelect component", () => {
    it("renders default value when collapsed", async () => {
        const {createElement} = await import("react");
        const {renderToStaticMarkup} = await import("react-dom/server");
        const {default: CustomSelect} = await import("./CustomSelect");

        const html = renderToStaticMarkup(createElement(CustomSelect, {
            onChange: () => undefined,
            defaultValue: "BMW",
            options: ["BMW", "Zoe"]
        }));

        expect(html).toContain("BMW");
        expect(html).toContain("aria-expanded=\"false\"");
    });
});
