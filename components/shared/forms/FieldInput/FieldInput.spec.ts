import {describe, expect, it, vi} from "vitest";

type ReactElementLike = {
    type: unknown;
    props?: {
        children?: unknown;
        onMouseDown?: (...args: unknown[]) => void;
        onMouseUp?: (...args: unknown[]) => void;
        onTouchStart?: (...args: unknown[]) => void;
        onTouchEnd?: (...args: unknown[]) => void;
        onFocus?: (...args: unknown[]) => void;
        className?: string;
        [key: string]: unknown;
    };
};

function isElementLike(node: unknown): node is ReactElementLike {
    return Boolean(node) && typeof node === "object" && "type" in (node as object);
}

function findElement(node: unknown, predicate: (element: ReactElementLike) => boolean): ReactElementLike | undefined {
    if (!node) {
        return undefined;
    }
    if (Array.isArray(node)) {
        for (const child of node) {
            const found = findElement(child, predicate);
            if (found) {
                return found;
            }
        }
        return undefined;
    }
    if (!isElementLike(node)) {
        return undefined;
    }
    if (predicate(node)) {
        return node;
    }
    return findElement(node.props?.children, predicate);
}

describe("FieldInput component", () => {
    it("renders value/placeholder and toggles microphone recording handlers", async () => {
        const setIsRecording = vi.fn();
        const setIsMicTouched = vi.fn();
        const onChange = vi.fn();
        vi.resetModules();
        vi.doMock("react", async () => {
            const actual = await vi.importActual<typeof import("react")>("react");
            let stateCall = 0;
            return {
                ...actual,
                useRef: () => ({current: onChange}),
                useEffect: () => undefined,
                useState: (initialValue: unknown) => {
                    stateCall += 1;
                    if (stateCall === 1) {
                        return [initialValue, setIsRecording] as const;
                    }
                    return [initialValue, setIsMicTouched] as const;
                }
            };
        });
        const {default: FieldInput} = await import("./FieldInput");

        const element = FieldInput({
            value: "123",
            placeholder: "Wert",
            onChange
        });

        const input = findElement(element, (currentElement) => currentElement.type === "input");
        expect(input?.props?.value).toBe("123");
        expect(input?.props?.placeholder).toBe("Wert");

        const select = vi.fn();
        input?.props?.onFocus?.({target: {select}});
        expect(select).toHaveBeenCalled();

        const microphone = findElement(element, (currentElement) => {
            const className = currentElement.props?.className;
            return typeof className === "string" && className.includes("microphoneContainer");
        });

        microphone?.props?.onMouseDown?.();
        microphone?.props?.onMouseUp?.();
        microphone?.props?.onTouchStart?.();
        microphone?.props?.onTouchEnd?.();

        expect(setIsMicTouched).toHaveBeenCalledWith(true);
        expect(setIsMicTouched).toHaveBeenCalledWith(false);
        expect(setIsRecording).toHaveBeenCalledWith(true);
        expect(setIsRecording).toHaveBeenCalledWith(false);
    });

    it("marks numeric value as valid and non-numeric as invalid", async () => {
        vi.resetModules();
        const {default: FieldInput} = await import("./FieldInput");
        const {createElement} = await import("react");
        const {renderToStaticMarkup} = await import("react-dom/server");
        const validHtml = renderToStaticMarkup(createElement(FieldInput, {value: "77.2", onChange: () => undefined}));
        const invalidHtml = renderToStaticMarkup(createElement(FieldInput, {value: "abc", onChange: () => undefined}));

        expect(validHtml).toContain("inputValid");
        expect(invalidHtml).toContain("inputInvalid");
    });
});
