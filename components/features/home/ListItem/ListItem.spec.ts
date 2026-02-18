import {describe, expect, it, vi} from "vitest";
import {dispatchChangeDataActions, isChangeCarDataAllowed} from "@/components/features/home/ListItem/ListItem.logic";
import {setDate} from "@/store/reducer/modal/date";
import {setId} from "@/store/reducer/modal/id";
import {setKilometer} from "@/store/reducer/modal/kilometer";
import {setLoadingStation} from "@/store/reducer/modal/loadingStationId";
import {setPower} from "@/store/reducer/modal/power";
import {setModalState} from "@/store/reducer/modalState";
import {ModalState} from "@/constants/enums";

describe("ListItem logic", () => {
    it("allows change mode only for first element within five minutes", () => {
        const now = new Date("2026-02-18T12:05:00.000Z");
        const recentDate = new Date("2026-02-18T12:02:00.000Z");
        const oldDate = new Date("2026-02-18T11:58:00.000Z");
        const futureDate = new Date("2026-02-18T12:06:00.000Z");

        expect(isChangeCarDataAllowed({isFirstElement: true, dataSetDate: recentDate, now})).toBe(true);
        expect(isChangeCarDataAllowed({isFirstElement: false, dataSetDate: recentDate, now})).toBe(false);
        expect(isChangeCarDataAllowed({isFirstElement: true, dataSetDate: oldDate, now})).toBe(false);
        expect(isChangeCarDataAllowed({isFirstElement: true, dataSetDate: futureDate, now})).toBe(false);
    });

    it("dispatches all change-data actions in the expected order", () => {
        const dispatch = vi.fn();
        const date = new Date("2026-02-18T12:02:00.000Z");
        const loadingStation = {id: "ls-1", name: "carport"};

        dispatchChangeDataActions({
            dispatch,
            date,
            kilometer: 1234,
            power: 56,
            id: "id-1",
            loadingStation
        });

        expect(dispatch).toHaveBeenNthCalledWith(1, setModalState(ModalState.ChangeCarData));
        expect(dispatch).toHaveBeenNthCalledWith(2, setDate(date));
        expect(dispatch).toHaveBeenNthCalledWith(3, setKilometer("1234"));
        expect(dispatch).toHaveBeenNthCalledWith(4, setPower("56"));
        expect(dispatch).toHaveBeenNthCalledWith(5, setId("id-1"));
        expect(dispatch).toHaveBeenNthCalledWith(6, setLoadingStation(loadingStation));
    });

    it("renders list item values in the component", async () => {
        vi.resetModules();
        vi.doMock("@/store/hooks", () => ({
            useAppDispatch: () => vi.fn()
        }));

        const {createElement} = await import("react");
        const {renderToStaticMarkup} = await import("react-dom/server");
        const {default: ListItem} = await import("./ListItem");

        const html = renderToStaticMarkup(createElement(ListItem, {
            isLight: true,
            date: new Date("2026-02-18T12:00:00.000Z"),
            kilometer: 1234,
            power: 45.6,
            name: "Tester",
            id: "id-1",
            loadingStation: {id: "ls-1", name: "carport"},
            isFirstElement: true
        }));

        expect(html).toContain("Tester");
        expect(html).toContain("1234");
    });

});
