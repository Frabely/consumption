import styles from '../styles/Display.module.css'
import ListItem from "@/components/ListItem";
import {DataSet} from "@/constants/types";
import {useEffect} from "react";
import {getFullDataSet} from "@/firebase/functions";
import {setDataSetArray} from "@/store/reducer/currentDataSet";
import {setKilometer} from "@/store/reducer/modal/kilometer";
import {ModalState} from "@/constants/enums";
import {setIsLoading} from "@/store/reducer/isLoading";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {
    selectCurrentCar,
    selectCurrentDataSet,
    selectModalState
} from "@/store/selectors";

export default function Display({}: DisplayProps) {
    const modalState = useAppSelector(selectModalState)
    const currentCar = useAppSelector(selectCurrentCar)
    const currentDataSet = useAppSelector(selectCurrentDataSet)
    const dispatch = useAppDispatch()
    useEffect(() => {
        if (modalState === ModalState.None && currentCar.name) {
            dispatch(setIsLoading(true))
            getFullDataSet(currentCar.name).then((dataSet) => {
                    if (dataSet) {
                        dispatch(setDataSetArray(dataSet))
                    }
                    else
                        dispatch(setDataSetArray([]))
                }
            ).catch((error) => {
                console.error(error.message)
            }).finally(() => {
                dispatch(setIsLoading(false))
            })
        }
        else if (currentCar.kilometer)
            dispatch(setKilometer(currentCar.kilometer.toString()))
    }, [currentCar, dispatch, modalState])

    return (
        <>
            <div className={styles.mainContainer}>
                <div className={styles.list}>
                    {currentDataSet.map((dataSet: DataSet, index: number) =>
                    {
                        if (index%2 === 0) {
                            return (
                                <ListItem key={dataSet.id}
                                          kilometer={dataSet.kilometer}
                                          date={dataSet.date}
                                          name={dataSet.name}
                                          power={dataSet.power}
                                          id={dataSet.id}
                                          isLight={true}
                                          loadingStation={dataSet.loadingStation}
                                          isFirstElement={index === 0}
                                />
                            )
                        }
                        else return (
                            <ListItem key={dataSet.id}
                                      kilometer={dataSet.kilometer}
                                      date={dataSet.date}
                                      name={dataSet.name}
                                      power={dataSet.power}
                                      id={dataSet.id}
                                      isLight={false}
                                      loadingStation={dataSet.loadingStation}
                                      isFirstElement={false}
                            />
                        )
                    })}
                </div>
            </div>
        </>
    )
}

export type DisplayProps = {}
