'use client'

import styles from "../styles/AddDataModal.module.css"
import de from '../constants/de.json'
import {useDispatch, useSelector} from "react-redux";
import {invertIsAddingDataModalActive} from "@/store/reducer/isAddingDataModalActive";
import {RootState} from "@/store/store";
import {setKilometer} from "@/store/reducer/modal/kilometer";
import {setPower} from "@/store/reducer/modal/power";
import {addDataSetToCollection, changeDataSetInCollection} from "@/firebase/functions";
import {setTime} from "@/store/reducer/modal/time";
import {setDate} from "@/store/reducer/modal/date";
import {setIsChangingData} from "@/store/reducer/isChangingData";
import {setHighestKilometer} from "@/store/reducer/highestKilometer";
import {ChangeEvent, useEffect, useState} from "react";

export default function AddDataModal({}: AddDataModalProps) {
    const dispatch = useDispatch()
    const state: RootState = useSelector((state: RootState) => state)
    const [isInputValid, setIsInputValid] = useState({
        kilometer: false,
        power: false
    })
    const [disabled, setDisabled] = useState(true);
    useEffect(() => {
        if (isInputValid.power && isInputValid.kilometer){
            setDisabled(false);
        }
        else setDisabled(true);
    }, [isInputValid])

    const getCurrentDate = () => {
        const dateNow = new Date()

        const hours = dateNow.getHours();
        const minutes = dateNow.getMinutes();
        const todayTime: string = `${hours < 10 ? `0` + hours : hours}:${minutes < 10 ? `0` + minutes : minutes}`

        const year = dateNow.getFullYear();
        const month = dateNow.getMonth() + 1;
        const day = dateNow.getDate();
        const todayDate = `${year}-${month < 10 ? `0` + month : month}-${day < 10 ? `0` + day : day}`
        return [todayTime, todayDate]
    }

    // const defaultKilometers = state.currentDataSet[0]?.kilometer ? state.currentDataSet[0]?.kilometer : 0

    const setModalToDefault = () => {
        dispatch(setPower(0))
        dispatch(setKilometer(state.highestKilometer.toString()))
        dispatch(setIsChangingData(false))
    }

    const onAddDataClickHandler = () => {
        const [todayTime, todayDate] = getCurrentDate()
        dispatch(setTime(todayTime))
        dispatch(setDate(todayDate))
        if (state.highestKilometer < parseInt(state.kilometer))
            dispatch(setHighestKilometer(parseInt(state.kilometer)))
        const {
            id,
            power,
            kilometer,
        } = state
        // dispatch(addDataSetToDataList({
        //     date: todayDate,
        //     time: todayTime,
        //     kilometer,
        //     power,
        //     name: 'Moritz'
        // }))
        if (state.isChangingData) {
            changeDataSetInCollection({
                id,
                date: todayDate,
                time: todayTime,
                kilometer: parseInt(kilometer),
                power,
                name: state.currentUser.name ? state.currentUser.name : ''
            })
        } else {
            addDataSetToCollection({
                date: todayDate,
                time: todayTime,
                kilometer: parseInt(kilometer),
                power,
                name: state.currentUser.name ? state.currentUser.name : ''
            })
        }
        dispatch(invertIsAddingDataModalActive())
        setModalToDefault()
    }
    const onAbortClickHandler = () => {
        dispatch(invertIsAddingDataModalActive())
        setModalToDefault()
    }

    function isKilometerValid(kilometer: string) {
        const kilometerNumber: undefined | number = parseInt(kilometer)
        return kilometerNumber && kilometerNumber > state.highestKilometer && kilometerNumber < 1000000
    }
    const onKilometerChange = (e: ChangeEvent<HTMLInputElement>) => {
        const currentKilometerValue: number | undefined = parseInt(e.target.value)
        if (currentKilometerValue && currentKilometerValue > 0)
            dispatch(setKilometer(currentKilometerValue.toString()))
        else
            dispatch(setKilometer(''))
        if (isKilometerValid(currentKilometerValue.toString())) {
            setIsInputValid({
                ...isInputValid,
                kilometer: true
            });
        } else {
            setIsInputValid({
                ...isInputValid,
                kilometer: false
            });
        }
    }

    function isPowerValid(power: number | undefined) {
        return power && power < 99.9 && power > 0.0;
    }

    function powerOnChangeHandler(event: ChangeEvent<HTMLInputElement>) {
        const power: number | undefined = parseFloat(event.target.value);
        dispatch(setPower(power ? power : 0.0))
        if (isPowerValid(power)) {
            setIsInputValid({
                ...isInputValid,
                power: true
            });
        } else {
            setIsInputValid({
                ...isInputValid,
                power: false
            });
        }
    }

    return (
        <div className={styles.mainContainer}>
            <form name={'addDataSet'} className={styles.mainInnerContainer}>
                {/*<input className={`${styles.input} ${styles.date}`} onChange={(e) => {*/}
                {/*    dispatch(setDate(e.target.value))*/}
                {/*}} value={state.date} type={"date"}/>*/}
                {/*<input className={`${styles.input} ${styles.time}`} onChange={(e) => {*/}
                {/*    dispatch(setTime(e.target.value))*/}
                {/*}} value={state.time} type={"time"}/>*/}
                <input value={state.kilometer}
                       className={`${styles.input} ${isInputValid.kilometer ? styles.inputValid : styles.inputInvalid}`}
                       type={"number"}
                       min={state.highestKilometer}
                       max={999999}
                       step={1.0}
                       onChange={(e) => {
                           onKilometerChange(e)
                       }}
                       placeholder={de.inputLabels.kilometer}
                />
                <input value={state.power ? state.power : ''}
                       className={`${styles.input} ${isInputValid.power ? styles.inputValid : styles.inputInvalid}`}
                       type={"number"}
                       min={0.1}
                       max={99.9}
                       step={0.1}
                       placeholder={de.inputLabels.power}
                       onChange={(e) => {
                           powerOnChangeHandler(e)
                       }}
                />
                {/*<input className={`${styles.input}`} disabled={true} type={"text"} placeholder={de.inputLabels.name}/>*/}
                <button disabled={disabled} onClick={onAddDataClickHandler} className={styles.button}>{
                    state.isChangingData ?
                        de.buttonLabels.changeData :
                        de.buttonLabels.addData
                }</button>
                <button onClick={onAbortClickHandler} className={styles.button}>{de.buttonLabels.abort}</button>
            </form>
        </div>
    );
}

export type AddDataModalProps = {}
