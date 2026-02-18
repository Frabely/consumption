import {ModalState} from "@/constants/enums";
import {DataSet} from "@/constants/types";
import {getFullDataSet} from "@/firebase/functions";
import {setDataSetArray} from "@/store/reducer/currentDataSet";
import {setIsLoading} from "@/store/reducer/isLoading";
import {setKilometer} from "@/store/reducer/modal/kilometer";

export type DisplayDispatchAction =
    | ReturnType<typeof setIsLoading>
    | ReturnType<typeof setDataSetArray>
    | ReturnType<typeof setKilometer>;

export type DisplayDispatch = (action: DisplayDispatchAction) => void;

export type GetFullDataSetFn = (carName: string) => Promise<DataSet[] | undefined>;

export type DisplayListItemData = {
    id: string;
    kilometer: number;
    date: Date;
    name: string;
    power: number;
    loadingStation: DataSet["loadingStation"];
    isLight: boolean;
    isFirstElement: boolean;
};

export const shouldLoadDataSet = (modalState: ModalState, carName?: string): boolean =>
    modalState === ModalState.None && !!carName;

export const syncKilometer = (kilometer: number | undefined, dispatch: DisplayDispatch): void => {
    if (kilometer) {
        dispatch(setKilometer(kilometer.toString()));
    }
};

export const mapDataSetToListItems = (dataSet: DataSet[]): DisplayListItemData[] =>
    dataSet.map((item, index) => ({
        id: item.id,
        kilometer: item.kilometer,
        date: item.date,
        name: item.name,
        power: item.power,
        loadingStation: item.loadingStation,
        isLight: index % 2 === 0,
        isFirstElement: index === 0
    }));

export const loadDataSetForCar = async ({
    carName,
    dispatch,
    getFullDataSetFn = getFullDataSet
}: {
    carName: string;
    dispatch: DisplayDispatch;
    getFullDataSetFn?: GetFullDataSetFn;
}): Promise<void> => {
    dispatch(setIsLoading(true));

    await getFullDataSetFn(carName)
        .then((dataSet) => {
            if (dataSet) {
                dispatch(setDataSetArray(dataSet));
            } else {
                dispatch(setDataSetArray([]));
            }
        })
        .catch((error: Error) => {
            console.error(error.message);
        })
        .finally(() => {
            dispatch(setIsLoading(false));
        });
};
