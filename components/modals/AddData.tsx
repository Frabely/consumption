'use client'

import styles from "../../styles/modals/AddData.module.css"
import de from '../../constants/de.json'
import {useDispatch, useSelector} from "react-redux";
import {closeIsAddingDataModalActive, invertIsAddingDataModalActive} from "@/store/reducer/isAddingDataModalActive";
import {RootState} from "@/store/store";
import {setKilometer} from "@/store/reducer/modal/kilometer";
import {setPower} from "@/store/reducer/modal/power";
import {addDataSetToCollection, changeDataSetInCollection} from "@/firebase/functions";
import {setTime} from "@/store/reducer/modal/time";
import {setDate} from "@/store/reducer/modal/date";
import {setIsChangingData} from "@/store/reducer/isChangingData";
import {setHighestKilometer} from "@/store/reducer/highestKilometer";
import {ChangeEvent, useEffect, useState} from "react";
import Modal from "@/components/layout/Modal";
import {DEFAULT_LOADING_STATION, loadingStations} from "@/constants/constantData";
import {setLoadingStation} from "@/store/reducer/modal/loadingStationId";

export default function AddData({prevKilometers}: AddDataModalProps) {
    const dispatch = useDispatch()
    const state: RootState = useSelector((state: RootState) => state)
    const [isInputValid, setIsInputValid] = useState({
        kilometer: isKilometerValid(state.kilometer),
        power: isPowerValid(state.power)
    })
    const [disabled, setDisabled] = useState(true);
    useEffect(() => {
        if (isInputValid.power && isInputValid.kilometer) {
            setDisabled(false);
        } else setDisabled(true);
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
        dispatch(setPower(''))
        dispatch(setKilometer(state.highestKilometer.toString()))
        dispatch(setIsChangingData(false))
        dispatch(setLoadingStation(DEFAULT_LOADING_STATION))
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
            loadingStation
        } = state
        if (state.isChangingData) {
            changeDataSetInCollection({
                id,
                date: todayDate,
                time: todayTime,
                kilometer: parseInt(kilometer),
                power: parseFloat(power),
                name: state.currentUser.name ? state.currentUser.name : '',
                loadingStation: loadingStation
            })
        } else {
            addDataSetToCollection({
                date: todayDate,
                time: todayTime,
                kilometer: parseInt(kilometer),
                power: parseFloat(power),
                name: state.currentUser.name ? state.currentUser.name : '',
                loadingStation: loadingStation
            })
        }
        dispatch(invertIsAddingDataModalActive())
        setModalToDefault()
    }
    const onAbortClickHandler = () => {
        dispatch(closeIsAddingDataModalActive())
        setModalToDefault()
    }

    function isKilometerValid(kilometer: string) {
        const kilometerNumber: undefined | number = parseInt(kilometer)
        if (state.isChangingData)
            return kilometerNumber && kilometerNumber > prevKilometers && kilometerNumber < 1000000
        else
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

    function isPowerValid(power: string) {
        const powerNumber = parseFloat(power)
        if (powerNumber !== undefined && !Number.isNaN(powerNumber)) {
            return powerNumber < 99.9 && powerNumber > 0.0;
        }
    }

    function powerOnChangeHandler(event: ChangeEvent<HTMLInputElement>) {
        const powerString: string = event.target.value
        dispatch(setPower(powerString))
        if (isPowerValid(powerString)) {
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

    const onLoadingStationChangeHandler = (event: ChangeEvent<HTMLSelectElement>) => {
        const selected = event.target.options.selectedIndex
        const id: string = event.target.options[selected].id
        const name: string = event.target.value
        dispatch(setLoadingStation({id, name}))
    }

    return (
        <Modal formName={'addData'}>
            <select onChange={onLoadingStationChangeHandler} className={styles.select}
                    defaultValue={state.isChangingData ? state.loadingStation.name : DEFAULT_LOADING_STATION.name}>
                {loadingStations.map((loadingStation) => {
                        return (
                            <option id={loadingStation.id} key={loadingStation.id}>
                                {loadingStation.name}
                            </option>
                        )
                    }
                )}
            </select>
            <input value={state.kilometer}
                   className={`${styles.input} ${isInputValid.kilometer ? styles.inputValid : styles.inputInvalid}`}
                   type={"number"}
                   min={state.isChangingData ? prevKilometers+1 : state.highestKilometer}
                   max={999999}
                   step={1.0}
                   onChange={(e) => {
                       onKilometerChange(e)
                   }}
                   placeholder={de.inputLabels.kilometer}
            />
            <input value={state.power}
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
            <button disabled={disabled} onClick={onAddDataClickHandler} className={styles.button}>{
                state.isChangingData ?
                    de.buttonLabels.changeData :
                    de.buttonLabels.addData
            }</button>
            <button onClick={onAbortClickHandler} className={styles.button}>{de.buttonLabels.abort}</button>
        </Modal>
    );
}

export type AddDataModalProps = {
    prevKilometers: number
}
