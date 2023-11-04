import styles from '../styles/Display.module.css'
import ListItem from "@/components/ListItem";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/store/store";
import {DataSet} from "@/constants/types";
import {useEffect} from "react";
import {getFullDataSet} from "@/firebase/functions";
import {setDataSetArray} from "@/store/reducer/currentDataSet";
import {setKilometer} from "@/store/reducer/modal/kilometer";

export default function Display({}: DisplayProps) {
    const state: RootState = useSelector((state: RootState) => state)
    const dispatch = useDispatch()
    useEffect(() => {
        if (!state.isAddingDataModalActive && state.currentCar.name)
            getFullDataSet(state.currentCar.name).then((dataSet) => {
                    if (dataSet) {
                        dispatch(setDataSetArray(dataSet))
                    }
                    else
                        dispatch(setDataSetArray([]))
                }
            ).catch((error) => {
                console.log(error.message)
            })
        else if (state.currentCar.kilometer)
            dispatch(setKilometer(state.currentCar.kilometer.toString()))
    }, [dispatch, state.isAddingDataModalActive, state.currentCar])

    return (
        <>
            <div className={styles.mainContainer} style={state.dimension.isHorizontal ? {paddingTop: '5vh', height: '87%'}: {}}>
                <div className={styles.list}>
                    {state.currentDataSet.map((dataSet: DataSet, index: number) =>
                    {
                        if (index%2 === 0) {
                            return (
                                <ListItem key={index}
                                          kilometer={dataSet.kilometer}
                                          date={dataSet.date}
                                          // time={dataSet.time}
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
                                      // time={dataSet.time}
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
