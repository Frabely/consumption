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

    it("renders only overlay shell when spinner visibility is false", async () => {
        vi.resetModules();
        vi.doMock("react", async () => {
            const actual = await vi.importActual<typeof import("react")>("react");
            const useStateMock = vi
                .fn()
                .mockReturnValueOnce([false, vi.fn()])
                .mockReturnValueOnce([0, vi.fn()])
                .mockReturnValueOnce([[], vi.fn()]);

            return {
                ...actual,
                useState: useStateMock,
                useEffect: vi.fn()
            };
        });

        const {createElement} = await import("react");
        const {renderToStaticMarkup} = await import("react-dom/server");
        const {default: Loading} = await import("./Loading");

        const html = renderToStaticMarkup(createElement(Loading));
        expect(html).toContain("isLoadingContainer");
        expect(html).not.toContain("dotLayer");
    });

    it("renders car and dots when spinner visibility is true", async () => {
        vi.resetModules();
        vi.doMock("react", async () => {
            const actual = await vi.importActual<typeof import("react")>("react");
            const useStateMock = vi
                .fn()
                .mockReturnValueOnce([true, vi.fn()])
                .mockReturnValueOnce([Math.PI, vi.fn()])
                .mockReturnValueOnce([
                    [{index: 0, angle: 0, isActive: true, respawnAtMs: 0}],
                    vi.fn()
                ]);

            return {
                ...actual,
                useState: useStateMock,
                useEffect: vi.fn(),
                useRef: vi.fn(() => ({current: 0}))
            };
        });

        const {createElement} = await import("react");
        const {renderToStaticMarkup} = await import("react-dom/server");
        const {default: Loading} = await import("./Loading");

        const html = renderToStaticMarkup(createElement(Loading));
        expect(html).toContain("dotLayer");
        expect(html).toContain("carBody");
    });

    it("delays spinner visibility by configured timeout", async () => {
        vi.useFakeTimers();
        vi.resetModules();
        const setIsVisible = vi.fn();
        vi.stubGlobal("window", {
            setTimeout,
            clearTimeout
        });
        vi.doMock("react", async () => {
            const actual = await vi.importActual<typeof import("react")>("react");
            const useStateMock = vi
                .fn()
                .mockReturnValueOnce([false, setIsVisible])
                .mockReturnValueOnce([0, vi.fn()])
                .mockReturnValueOnce([[], vi.fn()]);

            return {
                ...actual,
                useState: useStateMock,
                useEffect: vi.fn((callback: () => (() => void) | void) => {
                    callback();
                }),
                useRef: vi.fn(() => ({current: 0}))
            };
        });

        const {default: Loading} = await import("./Loading");
        Loading({});

        vi.advanceTimersByTime(LOADING_VISIBILITY_DELAY_MS - 1);
        expect(setIsVisible).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(setIsVisible).toHaveBeenCalledWith(true);
        vi.useRealTimers();
    });
});
