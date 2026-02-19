import { describe, expect, it, vi } from "vitest";

type ReactElementLike = {
  type: unknown;
  props?: {
    children?: unknown;
    onClick?: (...args: unknown[]) => void;
    className?: string;
    [key: string]: unknown;
  };
};

function isElementLike(node: unknown): node is ReactElementLike {
  return (
    Boolean(node) && typeof node === "object" && "type" in (node as object)
  );
}

function findElements(
  node: unknown,
  predicate: (element: ReactElementLike) => boolean,
): ReactElementLike[] {
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

describe("Modal component", () => {
  it("renders title and children", async () => {
    vi.resetModules();
    vi.doMock("@/store/hooks", () => ({
      useAppDispatch: () => vi.fn(),
    }));

    const { createElement } = await import("react");
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { default: Modal } = await import("./Modal");

    const html = renderToStaticMarkup(
      createElement(Modal, {
        formName: "TestModal",
        title: "Titel",
        children: "INHALT",
      }),
    );

    expect(html).toContain("Titel");
    expect(html).toContain("INHALT");
  });

  it("dispatches close action from header and inner close variants", async () => {
    vi.resetModules();
    const dispatch = vi.fn();
    vi.doMock("@/store/hooks", () => ({
      useAppDispatch: () => dispatch,
    }));
    vi.doMock("@/store/reducer/modalState", () => ({
      setModalStateNone: () => ({ type: "setModalStateNone" }),
    }));

    const { default: Modal } = await import("./Modal");
    const defaultElement = Modal({ formName: "A", children: "X", title: "T" });
    const iconsDefault = findElements(
      defaultElement,
      (currentElement) => typeof currentElement.props?.onClick === "function",
    );
    iconsDefault[0]?.props?.onClick?.();
    expect(dispatch).toHaveBeenCalledWith({ type: "setModalStateNone" });

    const innerElement = Modal({
      formName: "B",
      children: "Y",
      closeInsideContent: true,
      closeInsideFlow: false,
    });
    const iconsInner = findElements(
      innerElement,
      (currentElement) => typeof currentElement.props?.onClick === "function",
    );
    iconsInner[0]?.props?.onClick?.();
    expect(dispatch).toHaveBeenCalledWith({ type: "setModalStateNone" });

    const hiddenElement = Modal({
      formName: "C",
      children: "Z",
      hideCloseIcon: true,
    });
    const iconsHidden = findElements(
      hiddenElement,
      (currentElement) => typeof currentElement.props?.onClick === "function",
    );
    expect(iconsHidden.length).toBe(0);
  });
});
