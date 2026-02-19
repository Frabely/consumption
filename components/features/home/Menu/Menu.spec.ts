import {describe, expect, it, vi} from "vitest";
import {ModalState, Page, Role} from "@/constants/enums";
import {
    buildHomeMenuActions,
    resolveDefaultCarName,
    resolveSelectedCar
} from "@/components/features/home/Menu/Menu.logic";

describe("Menu logic", () => {
    const labels = {
        logout: "Logout",
        downloadCsv: "CSV",
        buildingConsumption: "Building"
    };

    it("builds base actions for non-admin users", () => {
        const actions = buildHomeMenuActions({
            role: Role.User,
            labels,
            onLogout: vi.fn(),
            onExportCsv: vi.fn(),
            onBuildingConsumption: vi.fn()
        });

        expect(actions.map((action) => action.id)).toEqual(["logout", "downloadCsv"]);
    });

    it("adds building action for admin users", () => {
        const actions = buildHomeMenuActions({
            role: Role.Admin,
            labels,
            onLogout: vi.fn(),
            onExportCsv: vi.fn(),
            onBuildingConsumption: vi.fn()
        });

        expect(actions.map((action) => action.id)).toEqual([
            "logout",
            "downloadCsv",
            "buildingConsumption"
        ]);
    });

    it("resolves selected/default car names", () => {
        const cars = [{name: "Zoe"}, {name: "BMW"}];

        expect(resolveSelectedCar(cars, "BMW")).toEqual({name: "BMW"});
        expect(resolveSelectedCar(cars, "Unknown")).toBeUndefined();
        expect(resolveDefaultCarName("BMW", cars)).toBe("BMW");
        expect(resolveDefaultCarName(undefined, cars)).toBe("Zoe");
        expect(resolveDefaultCarName(undefined, [])).toBe("");
    });

    it("renders action labels for admin users", async () => {
        vi.resetModules();
        vi.doMock("@/store/hooks", () => {
            const values = [Role.Admin, "Zoe"];
            return {
                useAppDispatch: () => vi.fn(),
                useAppSelector: () => values.shift()
            };
        });
        vi.doMock("@/components/shared/navigation/ActionMenu", () => ({
            default: ({actions}: {actions: Array<{id: string}>}) => actions.map((action) => action.id).join("|")
        }));

        const {createElement} = await import("react");
        const {renderToStaticMarkup} = await import("react-dom/server");
        const {default: Menu} = await import("./Menu");

        const html = renderToStaticMarkup(createElement(Menu));

        expect(html).toContain("logout");
        expect(html).toContain("downloadCsv");
        expect(html).toContain("buildingConsumption");
    });

    it("wires menu callbacks to dispatch and car loading", async () => {
        vi.resetModules();
        const dispatch = vi.fn();
        const getCars = vi.fn().mockResolvedValue([{name: "Zoe"}, {name: "BMW"}]);
        let capturedProps: {
            actions: Array<{ id: string; onClick?: () => void }>;
            selectConfig: { onChange?: (value: string) => void };
            primaryAction: { onClick?: () => void };
        } | undefined;

        vi.doMock("@/store/hooks", () => ({
            useAppDispatch: () => dispatch,
            useAppSelector: (selector: (state: { currentUser: { role: Role }; currentCar: { name: string } }) => unknown) =>
                selector({currentUser: {role: Role.Admin}, currentCar: {name: "Zoe"}})
        }));
        vi.doMock("@/firebase/functions", () => ({
            getCars
        }));
        vi.doMock("@/components/shared/navigation/ActionMenu", () => ({
            default: (props: typeof capturedProps) => {
                capturedProps = props;
                return null;
            }
        }));
        vi.doMock("@/store/reducer/modalState", () => ({
            setModalState: (payload: ModalState) => ({type: "setModalState", payload}),
            setModalStateNone: () => ({type: "setModalStateNone"})
        }));
        vi.doMock("@/store/reducer/isChangingData", () => ({
            setIsChangingData: (payload: boolean) => ({type: "setIsChangingData", payload})
        }));
        vi.doMock("@/store/reducer/currentUser", () => ({
            setCurrentUser: (payload: unknown) => ({type: "setCurrentUser", payload})
        }));
        vi.doMock("@/store/reducer/currentCar", () => ({
            setCurrentCar: (payload: unknown) => ({type: "setCurrentCar", payload})
        }));
        vi.doMock("@/store/reducer/currentPage", () => ({
            setPage: (payload: Page) => ({type: "setPage", payload})
        }));
        vi.doMock("@/store/reducer/currentDataSet", () => ({
            setDataSetArray: (payload: unknown[]) => ({type: "setDataSetArray", payload})
        }));
        vi.doMock("@/constants/constantData", () => ({
            EMPTY_USER: {name: "", role: Role.None},
            cars: [{name: "Zoe"}, {name: "BMW"}]
        }));

        const {createElement} = await import("react");
        const {renderToStaticMarkup} = await import("react-dom/server");
        const {default: Menu} = await import("./Menu");
        renderToStaticMarkup(createElement(Menu));

        capturedProps?.primaryAction?.onClick?.();
        expect(dispatch).toHaveBeenCalledWith({type: "setModalStateNone"});
        expect(dispatch).toHaveBeenCalledWith({type: "setIsChangingData", payload: false});
        expect(dispatch).toHaveBeenCalledWith({type: "setModalState", payload: ModalState.AddCarData});

        const logout = capturedProps?.actions.find((action) => action.id === "logout");
        logout?.onClick?.();
        expect(dispatch).toHaveBeenCalledWith({type: "setPage", payload: Page.Home});
        expect(dispatch).toHaveBeenCalledWith({type: "setDataSetArray", payload: []});

        const exportCsv = capturedProps?.actions.find((action) => action.id === "downloadCsv");
        exportCsv?.onClick?.();
        expect(dispatch).toHaveBeenCalledWith({type: "setModalState", payload: ModalState.DownloadCsv});

        const building = capturedProps?.actions.find((action) => action.id === "buildingConsumption");
        building?.onClick?.();
        expect(dispatch).toHaveBeenCalledWith({type: "setPage", payload: Page.BuildingConsumption});

        capturedProps?.selectConfig.onChange?.("BMW");
        await Promise.resolve();
        expect(getCars).toHaveBeenCalled();
        expect(dispatch).toHaveBeenCalledWith({type: "setCurrentCar", payload: {name: "BMW"}});
    });
});
