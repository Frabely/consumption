import {describe, expect, it, vi} from "vitest";

type ReactElementLike = {
    type: unknown;
    props?: {
        children?: unknown;
        onClick?: (...args: unknown[]) => void;
        onKeyDown?: (...args: unknown[]) => void;
        role?: string;
        [key: string]: unknown;
    };
};

function isElementLike(node: unknown): node is ReactElementLike {
    return Boolean(node) && typeof node === "object" && "type" in (node as object);
}

function findElements(node: unknown, predicate: (element: ReactElementLike) => boolean): ReactElementLike[] {
    if (!node) {
        return [];
    }
    if (Array.isArray(node)) {
        return node.flatMap((child) => findElements(child, predicate));
    }
    if (!isElementLike(node)) {
        return [];
    }
    const own = predicate(node) ? [node] : [];
    return [...own, ...findElements(node.props?.children, predicate)];
}

describe("CustomSelect component", () => {
    it("handles option selection, keyboard and outside click", async () => {
        vi.resetModules();
        const onChange = vi.fn();
        const setIsExpanded = vi.fn();
        const setSelectedValue = vi.fn();
        const addEventListener = vi.fn();
        const removeEventListener = vi.fn();
        vi.stubGlobal("document", {addEventListener, removeEventListener});

        vi.doMock("react", async () => {
            const actual = await vi.importActual<typeof import("react")>("react");
            let stateCall = 0;
            return {
                ...actual,
                useRef: () => ({current: {contains: () => false}}),
                useEffect: (callback: () => void) => callback(),
                useState: () => {
                    stateCall += 1;
                    if (stateCall === 1) {
                        return [true, setIsExpanded] as const;
                    }
                    return ["BMW", setSelectedValue] as const;
                }
            };
        });
        const {default: CustomSelect} = await import("./CustomSelect");
        const element = CustomSelect({
            onChange,
            defaultValue: "BMW",
            options: ["BMW", "Zoe"],
            keys: ["bmw", "zoe"]
        });

        const button = findElements(element, (currentElement) => currentElement.props?.role === "button")[0];
        button?.props?.onClick?.();
        expect(setIsExpanded).toHaveBeenCalledWith(false);

        const options = findElements(element, (currentElement) => typeof currentElement.props?.className === "string" && currentElement.props?.className.includes("optionContainer"));
        options[1]?.props?.onClick?.();
        expect(setSelectedValue).toHaveBeenCalledWith("Zoe");
        expect(onChange).toHaveBeenCalledWith("Zoe", "zoe");
        expect(setIsExpanded).toHaveBeenCalledWith(false);

        const preventDefault = vi.fn();
        button?.props?.onKeyDown?.({key: "Enter", preventDefault});
        button?.props?.onKeyDown?.({key: " ", preventDefault});
        button?.props?.onKeyDown?.({key: "Escape"});
        expect(preventDefault).toHaveBeenCalled();
        expect(setIsExpanded).toHaveBeenCalledWith(false);

        const mouseHandler = addEventListener.mock.calls.find((call) => call[0] === "mousedown")?.[1] as ((event: {target: unknown}) => void);
        mouseHandler?.({target: {}});
        expect(setIsExpanded).toHaveBeenCalledWith(false);

        const cleanup = removeEventListener.mock.calls.find((call) => call[0] === "mousedown");
        expect(cleanup).toBeUndefined();
    });
});
