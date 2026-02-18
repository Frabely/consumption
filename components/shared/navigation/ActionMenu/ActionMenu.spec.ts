import {describe, expect, it} from "vitest";
import {faAdd, faArrowRight, faDownload} from "@fortawesome/free-solid-svg-icons";

describe("ActionMenu component", () => {
    it("renders closed menu with primary action button", async () => {
        const {createElement} = await import("react");
        const {renderToStaticMarkup} = await import("react-dom/server");
        const {default: ActionMenu} = await import("./ActionMenu");

        const html = renderToStaticMarkup(createElement(ActionMenu, {
            actions: [
                {id: "home", label: "Home", icon: faArrowRight, onClick: () => undefined},
                {id: "csv", label: "CSV", icon: faDownload, onClick: () => undefined}
            ],
            primaryAction: {
                icon: faAdd,
                onClick: () => undefined
            }
        }));

        expect(html).toContain("aria-expanded=\"false\"");
        expect(html).toContain("button");
    });
});
