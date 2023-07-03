'use client'

import styles from "../../styles/modals/AddData.module.css"
import de from '../../constants/de.json'
import {useDispatch, useSelector} from "react-redux";
import {closeIsAddingDataModalActive, invertIsAddingDataModalActive} from "@/store/reducer/isAddingDataModalActive";
import {RootState} from "@/store/store";
import {setKilometer} from "@/store/reducer/modal/kilometer";
import {setPower} from "@/store/reducer/modal/power";
import {addDataSetToCollection, changeDataSetInCollection, updateCarKilometer} from "@/firebase/functions";
import {setIsChangingData} from "@/store/reducer/isChangingData";
import {ChangeEvent, useEffect, useState} from "react";
import Modal from "@/components/layout/Modal";
import {DEFAULT_LOADING_STATION, loadingStations} from "@/constants/constantData";
import {setLoadingStation} from "@/store/reducer/modal/loadingStationId";
import {Language} from "@/constants/types";
import {updateCarKilometers, updateCarPrevKilometers} from "@/store/reducer/currentCar";
import {setDate} from "@/store/reducer/modal/date";

export default function AddData({prevKilometers}: AddDataModalProps) {
    const language: Language = de
    const dispatch = useDispatch()
    const state: RootState = useSelector((state: RootState) => state)
    const [isInputValid, setIsInputValid] = useState({
        kilometer: isKilometerValid(state.kilometer),
        power: isPowerValid(state.power)
    })
    const [disabled, setDisabled] = useState(true);

    useEffect(() => {
        if (state.currentCar.kilometer)
            dispatch(setKilometer(state.currentCar.kilometer.toString()))
    }, [dispatch, state.currentCar.kilometer])

    useEffect(() => {
        if (isInputValid.power && isInputValid.kilometer) {
            setDisabled(false);
        } else setDisabled(true);
    }, [isInputValid])

    const setModalToDefault = () => {
        dispatch(setPower(''))
        if (state.currentCar.kilometer)
            dispatch(setKilometer(state.currentCar.kilometer.toString()))
        dispatch(setIsChangingData(false))
        dispatch(setLoadingStation(DEFAULT_LOADING_STATION))
    }

    const onAddDataClickHandler = () => {
        if (state.currentCar.kilometer && state.currentCar.name && state.currentCar.kilometer < parseInt(state.kilometer)) {
            const dateNow = new Date()
            dispatch(setDate(dateNow))
            const carKilometersPreUpdate = state.currentCar.kilometer
            dispatch(updateCarPrevKilometers(carKilometersPreUpdate))
            dispatch(updateCarKilometers(parseInt(state.kilometer)))
            const {
                power,
                kilometer,
                loadingStation
            } = state

            addDataSetToCollection(state.currentCar.name, {
                date: dateNow,
                kilometer: parseInt(kilometer),
                power: parseFloat(power),
                name: state.currentUser.name ? state.currentUser.name : '',
                loadingStation: loadingStation
            })
            console.log()
            updateCarKilometer(state.currentCar.name, parseInt(state.kilometer), carKilometersPreUpdate)
                .catch((error: Error) => {
                    console.log(error.message)
                })

            dispatch(invertIsAddingDataModalActive())
            setModalToDefault()
        } else
            alert('Invalid Data')
    }

    const onChangeDataClickHandler = () => {
        if (state.currentCar.kilometer && state.currentCar.name && state.currentCar.prevKilometer && state.currentCar.prevKilometer < parseInt(state.kilometer)) {
            dispatch(updateCarKilometers(parseInt(state.kilometer)))
            const {
                id,
                power,
                kilometer,
                loadingStation,
                date
            } = state
            changeDataSetInCollection(state.currentCar.name,
                date,
                parseFloat(power),
                parseInt(kilometer),
                loadingStation,
                id
            )
            updateCarKilometer(state.currentCar.name, parseInt(state.kilometer))
                .catch((error: Error) => {
                    console.log(error.message)
                })
            dispatch(invertIsAddingDataModalActive())
            setModalToDefault()
        } else
            alert('Invalid Data')
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
            return kilometerNumber && state.currentCar.kilometer && kilometerNumber > state.currentCar.kilometer && kilometerNumber < 1000000
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
                    defaultValue={state.isChangingData ? language.loadingStation[`${state.loadingStation.name}`] : DEFAULT_LOADING_STATION.name}>
                {loadingStations.map((loadingStation) => {

                        return (
                            <option id={loadingStation.id} key={loadingStation.id}>
                                {language.loadingStation[`${loadingStation.name}`]}
                            </option>
                        )
                    }
                )}
            </select>
            <input value={state.kilometer}
                   className={`${styles.input} ${isInputValid.kilometer ? styles.inputValid : styles.inputInvalid}`}
                   type={"number"}
                   min={state.currentCar.kilometer ? state.isChangingData ? prevKilometers + 1 : state.currentCar.kilometer : state.currentCar.kilometer}
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
            <button disabled={disabled}
                    onClick={state.isChangingData ? onChangeDataClickHandler : onAddDataClickHandler}
                    className={styles.button}>{
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
