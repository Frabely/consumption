import { describe, expect, it } from "vitest";
import {
  faAdd,
  faArrowRight,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { vi } from "vitest";

type ReactElementLike = {
  type: unknown;
  props?: {
    children?: unknown;
    onClick?: (...args: unknown[]) => void;
    onChange?: (...args: unknown[]) => void;
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

describe("ActionMenu component", () => {
  it("renders closed state by default", async () => {
    const { createElement } = await import("react");
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { default: ActionMenu } = await import("./ActionMenu");

    const html = renderToStaticMarkup(
      createElement(ActionMenu, {
        actions: [
          {
            id: "home",
            label: "Home",
            icon: faArrowRight,
            onClick: () => undefined,
          },
        ],
        primaryAction: {
          icon: faAdd,
          onClick: () => undefined,
        },
      }),
    );

    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain("Home");
  });

  it("toggles menu, executes actions and forwards primary/select actions", async () => {
    vi.resetModules();
    const setMenuOpen = vi.fn();
    const onMenuAction = vi.fn();
    const onPrimaryAction = vi.fn();
    const onSelectChange = vi.fn();
    const CustomSelectMock = function CustomSelectMock() {
      return null;
    };

    vi.doMock("react", async () => {
      const actual = await vi.importActual<typeof import("react")>("react");
      return {
        ...actual,
        useState: () => [true, setMenuOpen],
      };
    });
    vi.doMock("@/components/shared/forms/CustomSelect", () => ({
      default: CustomSelectMock,
    }));
    const { default: ActionMenuComponent } = await import("./ActionMenu");
    const ActionMenu = ActionMenuComponent as unknown as (props: {
      actions: Array<{
        id: string;
        label: string;
        icon: unknown;
        onClick?: () => void;
      }>;
      selectConfig?: {
        defaultValue: string;
        options: string[];
        onChange?: (value: string) => void;
      };
      primaryAction?: { icon: unknown; onClick?: () => void };
    }) => unknown;
    const element = ActionMenu({
      actions: [
        {
          id: "home",
          label: "Home",
          icon: faArrowRight,
          onClick: onMenuAction,
        },
        { id: "csv", label: "CSV", icon: faDownload, onClick: () => undefined },
      ],
      selectConfig: {
        defaultValue: "BMW",
        options: ["BMW", "Zoe"],
        onChange: onSelectChange,
      },
      primaryAction: {
        icon: faAdd,
        onClick: onPrimaryAction,
      },
    });

    const buttons = findElements(
      element,
      (currentElement) => currentElement.type === "button",
    );
    const menuToggle = buttons[0];
    const firstAction = buttons[1];
    const primary = buttons[buttons.length - 1];

    menuToggle?.props?.onClick?.();
    expect(setMenuOpen).toHaveBeenCalledWith(false);

    firstAction?.props?.onClick?.();
    expect(onMenuAction).toHaveBeenCalled();
    expect(setMenuOpen).toHaveBeenCalledWith(false);

    primary?.props?.onClick?.();
    expect(onPrimaryAction).toHaveBeenCalled();

    const select = findElements(
      element,
      (currentElement) => currentElement.type === CustomSelectMock,
    )[0];
    select?.props?.onChange?.("Zoe");
    expect(onSelectChange).toHaveBeenCalledWith("Zoe");
  });
});
