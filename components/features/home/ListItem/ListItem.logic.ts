import {ModalState} from "@/constants/enums";
import {LoadingStation} from "@/common/models";
import {setIsChangingData} from "@/store/reducer/isChangingData";
import {setDate} from "@/store/reducer/modal/date";
import {setId} from "@/store/reducer/modal/id";
import {setKilometer} from "@/store/reducer/modal/kilometer";
import {setLoadingStation} from "@/store/reducer/modal/loadingStationId";
import {setPower} from "@/store/reducer/modal/power";
import {setModalState} from "@/store/reducer/modalState";

export type ListItemDispatchAction =
    | ReturnType<typeof setIsChangingData>
    | ReturnType<typeof setModalState>
    | ReturnType<typeof setDate>
    | ReturnType<typeof setKilometer>
    | ReturnType<typeof setPower>
    | ReturnType<typeof setId>
    | ReturnType<typeof setLoadingStation>;

export type ListItemDispatch = (action: ListItemDispatchAction) => void;

const MILLISECONDS_TO_MINUTES = 60000;

export const isChangeCarDataAllowed = ({
    isFirstElement,
    dataSetDate,
    now = new Date()
}: {
    isFirstElement: boolean;
    dataSetDate: Date;
    now?: Date;
}): boolean => {
    const diffMinutes =
        Math.floor(now.getTime() / MILLISECONDS_TO_MINUTES) -
        Math.floor(dataSetDate.getTime() / MILLISECONDS_TO_MINUTES);
    return isFirstElement && diffMinutes >= 0 && diffMinutes < 5;
};

export const dispatchChangeDataActions = ({
    dispatch,
    date,
    kilometer,
    power,
    id,
    loadingStation
}: {
    dispatch: ListItemDispatch;
    date: Date;
    kilometer: number;
    power: number;
    id: string;
    loadingStation: LoadingStation;
}): void => {
    dispatch(setModalState(ModalState.ChangeCarData));
    dispatch(setDate(date));
    dispatch(setKilometer(kilometer.toString()));
    dispatch(setPower(power.toString()));
    dispatch(setId(id));
    dispatch(setLoadingStation(loadingStation));
};

