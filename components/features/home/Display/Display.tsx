import styles from './Display.module.css'
import ListItem from "@/components/features/home/ListItem";
import {useEffect} from "react";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {
    selectCurrentCar,
    selectCurrentDataSet,
    selectModalState
} from "@/store/selectors";
import {
    DisplayListItemData,
    loadDataSetForCar,
    mapDataSetToListItems,
    shouldLoadDataSet,
    syncKilometer
} from "@/components/features/home/Display/Display.logic";

export default function Display({}: DisplayProps) {
    const modalState = useAppSelector(selectModalState)
    const currentCar = useAppSelector(selectCurrentCar)
    const currentDataSet = useAppSelector(selectCurrentDataSet)
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (shouldLoadDataSet(modalState, currentCar.name)) {
            void loadDataSetForCar({carName: currentCar.name!, dispatch})
        } else {
            syncKilometer(currentCar.kilometer, dispatch)
        }
    }, [currentCar, dispatch, modalState])

    const listItems = mapDataSetToListItems(currentDataSet)

    return (
        <>
            <div className={styles.mainContainer}>
                <div className={styles.list}>
                    {listItems.map((dataSet: DisplayListItemData) =>
                    {
                        return (
                            <ListItem key={dataSet.id}
                                      kilometer={dataSet.kilometer}
                                      date={dataSet.date}
                                      name={dataSet.name}
                                      power={dataSet.power}
                                      id={dataSet.id}
                                      isLight={dataSet.isLight}
                                      loadingStation={dataSet.loadingStation}
                                      isFirstElement={dataSet.isFirstElement}
                            />
                        )
                    })}
                </div>
            </div>
        </>
    )
}

export type DisplayProps = {}
