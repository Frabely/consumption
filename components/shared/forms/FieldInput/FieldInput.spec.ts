import {describe, expect, it} from "vitest";

describe("FieldInput component", () => {
    it("renders input value and placeholder", async () => {
        const {createElement} = await import("react");
        const {renderToStaticMarkup} = await import("react-dom/server");
        const {default: FieldInput} = await import("./FieldInput");

        const html = renderToStaticMarkup(createElement(FieldInput, {
            value: "123",
            placeholder: "Wert",
            onChange: () => undefined
        }));

        expect(html).toContain("123");
        expect(html).toContain("Wert");
    });
});
