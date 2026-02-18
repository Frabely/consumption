import {describe, expect, it, vi} from "vitest";

describe("Modal component", () => {
    it("renders title and children", async () => {
        vi.resetModules();
        vi.doMock("@/store/hooks", () => ({
            useAppDispatch: () => vi.fn()
        }));

        const {createElement} = await import("react");
        const {renderToStaticMarkup} = await import("react-dom/server");
        const {default: Modal} = await import("./Modal");

        const html = renderToStaticMarkup(createElement(Modal, {
            formName: "TestModal",
            title: "Titel"
        }, "INHALT"));

        expect(html).toContain("Titel");
        expect(html).toContain("INHALT");
    });
});
