import {describe, expect, it, vi} from "vitest";

describe("DownloadCsv component", () => {
    it("renders selected car and action buttons", async () => {
        vi.resetModules();
        vi.doMock("@/store/hooks", () => ({
            useAppDispatch: () => vi.fn(),
            useAppSelector: () => ({name: "Zoe"})
        }));
        vi.doMock("@/components/shared/overlay/Modal", () => ({
            default: ({children}: {children: unknown}) => children
        }));
        vi.doMock("@/firebase/functions", () => ({
            getFullDataSet: vi.fn()
        }));

        const {createElement} = await import("react");
        const {renderToStaticMarkup} = await import("react-dom/server");
        const {default: DownloadCsv} = await import("./DownloadCsv");

        const html = renderToStaticMarkup(createElement(DownloadCsv));

        expect(html).toContain("Zoe");
        expect(html).toContain("button");
    });
});
