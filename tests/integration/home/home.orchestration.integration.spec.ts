import { describe, expect, it, vi } from "vitest";
import { ModalState } from "@/constants/enums";

describe("home orchestration integration", () => {
  it("loads main page data and dispatches loading start plus reload flags", async () => {
    vi.resetModules();
    const dispatch = vi.fn();
    const loadMainPageData = vi.fn().mockResolvedValue(undefined);

    vi.doMock("react", async () => {
      const actual = await vi.importActual<typeof import("react")>("react");
      return {
        ...actual,
        useEffect: (callback: () => void | Promise<void>) => {
          void callback();
        },
      };
    });

    vi.doMock("@/store/hooks", () => {
      const selectorValues: unknown[] = [
        false,
        { key: "u-1", defaultCar: "Zoe" },
        ModalState.None,
        { name: "Zoe", kilometer: 12000, prevKilometer: 11900 },
      ];
      return {
        useAppDispatch: () => dispatch,
        useAppSelector: () => selectorValues.shift(),
      };
    });

    vi.doMock("@/constants/constantData", () => ({
      cars: [{ name: "Zoe", kilometer: 12000, prevKilometer: 11900 }],
      loadMainPageData,
    }));

    vi.doMock("@/store/reducer/isLoading", () => ({
      setIsLoading: (payload: boolean) => ({ type: "setIsLoading", payload }),
    }));
    vi.doMock("@/store/reducer/isReloadDataNeeded", () => ({
      setIsReloadNeeded: (payload: unknown) => ({ type: "setIsReloadNeeded", payload }),
    }));
    vi.doMock("@/store/reducer/currentCar", () => ({
      setCurrentCar: (payload: unknown) => ({ type: "setCurrentCar", payload }),
    }));

    vi.doMock("@/components/features/home/Menu", () => ({ default: () => "MENU" }));
    vi.doMock("@/components/features/home/Display", () => ({ default: () => "DISPLAY" }));
    vi.doMock("@/components/features/home/Statistics", () => ({ default: () => "STATS" }));
    vi.doMock("@/components/features/home/Loading", () => ({ default: () => "LOADING" }));
    vi.doMock("@/components/features/home/modals/AddData", () => ({ default: () => "ADD_DATA" }));
    vi.doMock("@/components/features/home/modals/DownloadCsv", () => ({ default: () => "DOWNLOAD_CSV" }));
    vi.doMock("@/components/features/home/Login", () => ({ default: () => "LOGIN" }));
    vi.doMock("@/components/shared/navigation/CustomTab", () => ({
      default: () => "TAB",
    }));

    const { createElement } = await import("react");
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { default: Home } = await import("@/components/features/home/pages/Home");

    const html = renderToStaticMarkup(createElement(Home));
    await Promise.resolve();
    await Promise.resolve();

    expect(html).toContain("MENU");
    expect(html).toContain("DISPLAY");
    expect(loadMainPageData).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ type: "setIsLoading", payload: true });
    expect(dispatch).toHaveBeenCalledWith({
      type: "setIsReloadNeeded",
      payload: {
        isReloadHousesNeeded: true,
        isReloadCarsNeeded: false,
        isReloadFieldsNeeded: true,
        isReloadDataSetNeeded: false,
        isReloadLoadingStationsNeeded: false,
      },
    });
  });

  it("hydrates current car by selected car name when kilometer is missing", async () => {
    vi.resetModules();
    const dispatch = vi.fn();

    vi.doMock("react", async () => {
      const actual = await vi.importActual<typeof import("react")>("react");
      return {
        ...actual,
        useEffect: (callback: () => void | Promise<void>) => {
          void callback();
        },
      };
    });

    vi.doMock("@/store/hooks", () => {
      const selectorValues: unknown[] = [
        false,
        { key: "u-1", defaultCar: "BMW" },
        ModalState.None,
        { name: "Zoe", kilometer: undefined, prevKilometer: 0 },
      ];
      return {
        useAppDispatch: () => dispatch,
        useAppSelector: () => selectorValues.shift(),
      };
    });

    vi.doMock("@/constants/constantData", () => ({
      cars: [
        { name: "Zoe", kilometer: 12000, prevKilometer: 11900 },
        { name: "BMW", kilometer: 45000, prevKilometer: 44900 },
      ],
      loadMainPageData: vi.fn().mockResolvedValue(undefined),
    }));

    vi.doMock("@/store/reducer/isLoading", () => ({
      setIsLoading: (payload: boolean) => ({ type: "setIsLoading", payload }),
    }));
    vi.doMock("@/store/reducer/isReloadDataNeeded", () => ({
      setIsReloadNeeded: (payload: unknown) => ({ type: "setIsReloadNeeded", payload }),
    }));
    vi.doMock("@/store/reducer/currentCar", () => ({
      setCurrentCar: (payload: unknown) => ({ type: "setCurrentCar", payload }),
    }));

    vi.doMock("@/components/features/home/Menu", () => ({ default: () => "MENU" }));
    vi.doMock("@/components/features/home/Display", () => ({ default: () => "DISPLAY" }));
    vi.doMock("@/components/features/home/Statistics", () => ({ default: () => "STATS" }));
    vi.doMock("@/components/features/home/Loading", () => ({ default: () => "LOADING" }));
    vi.doMock("@/components/features/home/modals/AddData", () => ({ default: () => "ADD_DATA" }));
    vi.doMock("@/components/features/home/modals/DownloadCsv", () => ({ default: () => "DOWNLOAD_CSV" }));
    vi.doMock("@/components/features/home/Login", () => ({ default: () => "LOGIN" }));
    vi.doMock("@/components/shared/navigation/CustomTab", () => ({
      default: () => "TAB",
    }));

    const { createElement } = await import("react");
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { default: Home } = await import("@/components/features/home/pages/Home");

    renderToStaticMarkup(createElement(Home));
    await Promise.resolve();
    await Promise.resolve();

    expect(dispatch).toHaveBeenCalledWith({
      type: "setCurrentCar",
      payload: { name: "Zoe", kilometer: 12000, prevKilometer: 11900 },
    });
  });
});
