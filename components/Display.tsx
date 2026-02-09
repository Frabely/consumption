import styles from '../styles/Display.module.css'
import ListItem from "@/components/ListItem";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/store/store";
import {DataSet} from "@/constants/types";
import {useEffect} from "react";
import {getFullDataSet} from "@/firebase/functions";
import {setDataSetArray} from "@/store/reducer/currentDataSet";
import {setKilometer} from "@/store/reducer/modal/kilometer";
import {ModalState} from "@/constants/enums";
import {setIsLoading} from "@/store/reducer/isLoading";

export default function Display({}: DisplayProps) {
    const state: RootState = useSelector((state: RootState) => state)
    const dispatch = useDispatch()
    useEffect(() => {
        if (state.modalState === ModalState.None && state.currentCar.name) {
            dispatch(setIsLoading(true))
            getFullDataSet(state.currentCar.name).then((dataSet) => {
                    if (dataSet) {
                        dispatch(setDataSetArray(dataSet))
                    }
                    else
                        dispatch(setDataSetArray([]))
                }
            ).catch((error) => {
                console.log(error.message)
            }).finally(() => {
                dispatch(setIsLoading(false))
            })
        }
        else if (state.currentCar.kilometer)
            dispatch(setKilometer(state.currentCar.kilometer.toString()))
    }, [dispatch, state.modalState, state.currentCar])

    return (
        <>
            <div className={styles.mainContainer} style={state.dimension.isHorizontal ? {paddingTop: '0dvh', paddingBottom: '0', height: '85%'}: {}}>
                <div className={styles.list}>
                    {state.currentDataSet.map((dataSet: DataSet, index: number) =>
                    {
                        if (index%2 === 0) {
                            return (
                                <ListItem key={index}
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
                            <ListItem key={index}
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
