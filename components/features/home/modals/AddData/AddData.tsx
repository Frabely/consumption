'use client'

import styles from "./AddData.module.css"
import de from '@/constants/de.json'
import {setModalStateNone} from "@/store/reducer/modalState";
import {setKilometer} from "@/store/reducer/modal/kilometer";
import {setPower} from "@/store/reducer/modal/power";
import {addDataSetToCollection, changeDataSetInCollection, updateCarKilometer} from "@/firebase/functions";
import {setIsChangingData} from "@/store/reducer/isChangingData";
import {ChangeEvent, useEffect, useState} from "react";
import Modal from "@/components/shared/overlay/Modal";
import {DEFAULT_LOADING_STATION, ensureCarsLoaded, loadingStations} from "@/constants/constantData";
import {setLoadingStation} from "@/store/reducer/modal/loadingStationId";
import {Language} from "@/constants/types";
import {setCurrentCar, updateCarKilometers, updateCarPrevKilometers} from "@/store/reducer/currentCar";
import {setDate} from "@/store/reducer/modal/date";
import {ModalState} from "@/constants/enums";
import CustomSelect from "@/components/shared/forms/CustomSelect";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBolt, faCarSide} from "@fortawesome/free-solid-svg-icons";
import {
    selectCurrentCar,
    selectCurrentUser,
    selectDate,
    selectId,
    selectIsChangingData,
    selectKilometer,
    selectLoadingStation,
    selectModalState,
    selectPower
} from "@/store/selectors";
import {isKilometerValid, isPowerValid, parseIntegerOrNull} from "@/utils/validation/carDataValidation";

export default function AddData({prevKilometers}: AddDataModalProps) {
    const language: Language = de
    const dispatch = useAppDispatch()
    const modalState = useAppSelector(selectModalState)
    const currentCar = useAppSelector(selectCurrentCar)
    const currentUser = useAppSelector(selectCurrentUser)
    const kilometer = useAppSelector(selectKilometer)
    const power = useAppSelector(selectPower)
    const loadingStation = useAppSelector(selectLoadingStation)
    const id = useAppSelector(selectId)
    const date = useAppSelector(selectDate)
    const changingData = useAppSelector(selectIsChangingData)
    const [isInputValid, setIsInputValid] = useState({
        kilometer: isKilometerValid({
            kilometer,
            isChangingData: changingData,
            prevKilometers,
            currentCarKilometer: currentCar.kilometer
        }),
        power: isPowerValid(power)
    })
    const [disabled, setDisabled] = useState(true);

    useEffect(() => {
        const isAddOrChangeModal =
            modalState === ModalState.AddCarData || modalState === ModalState.ChangeCarData
        if (!isAddOrChangeModal) {
            return
        }
        if (currentCar.kilometer !== undefined) {
            return
        }

        /**
         * Hydrates missing current-car data when add/change dialogs are opened.
         * @returns Promise resolved when hydration attempt is complete.
         */
        const hydrateCurrentCarForModal = async (): Promise<void> => {
            const loadedCars = await ensureCarsLoaded()
            if (loadedCars.length === 0) {
                return
            }
            const selectedCar = loadedCars.find((car) => car.name === currentCar.name)
            if (selectedCar) {
                dispatch(setCurrentCar(selectedCar))
                return
            }
            if (!currentUser.defaultCar) {
                return
            }
            const defaultCar = loadedCars.find((car) => car.name === currentUser.defaultCar)
            if (defaultCar) {
                dispatch(setCurrentCar(defaultCar))
            }
        }

        void hydrateCurrentCarForModal()
    }, [currentCar.kilometer, currentCar.name, currentUser.defaultCar, dispatch, modalState])

    useEffect(() => {
        if (modalState === ModalState.AddCarData) {
            dispatch(setPower(""));
            if (currentCar.kilometer !== undefined) {
                dispatch(setKilometer(currentCar.kilometer.toString()));
            }
            dispatch(setIsChangingData(false));
            dispatch(setLoadingStation(DEFAULT_LOADING_STATION));
            setIsInputValid({
                kilometer: false,
                power: false
            });
        }
    }, [currentCar.kilometer, dispatch, modalState]);

    useEffect(() => {
        if (currentCar.kilometer !== undefined) {
            dispatch(setKilometer(currentCar.kilometer.toString()))
        }
    }, [currentCar.kilometer, dispatch])

    useEffect(() => {
        if (isInputValid.power && isInputValid.kilometer) {
            setDisabled(false);
        } else setDisabled(true);
    }, [isInputValid])

    const setModalToDefault = () => {
        dispatch(setPower(''))
        if (currentCar.kilometer !== undefined)
            dispatch(setKilometer(currentCar.kilometer.toString()))
        dispatch(setIsChangingData(false))
        dispatch(setLoadingStation(DEFAULT_LOADING_STATION))
        setIsInputValid({
            kilometer: false,
            power: false
        })
    }

    const onAddDataClickHandler = () => {
        const kilometerValue = parseIntegerOrNull(kilometer)
        if (currentCar.kilometer !== undefined && currentCar.name && kilometerValue !== null && currentCar.kilometer < kilometerValue) {
            const dateNow = new Date()
            dispatch(setDate(dateNow))
            const carKilometersPreUpdate = currentCar.kilometer
            dispatch(updateCarPrevKilometers(carKilometersPreUpdate))
            dispatch(updateCarKilometers(kilometerValue))

            addDataSetToCollection(currentCar.name, {
                date: dateNow,
                kilometer: kilometerValue,
                power: parseFloat(power),
                name: currentUser.name ? currentUser.name : '',
                loadingStation
            })
            updateCarKilometer(currentCar.name, kilometerValue, carKilometersPreUpdate)
                .catch((error: Error) => {
                    console.error(error.message)
                })

            dispatch(setModalStateNone())
            setModalToDefault()
        } else
            alert('Invalid Data')
    }

    const onChangeDataClickHandler = () => {
        const kilometerValue = parseIntegerOrNull(kilometer)
        if (currentCar.kilometer !== undefined && currentCar.name && currentCar.prevKilometer !== undefined && kilometerValue !== null && currentCar.prevKilometer < kilometerValue) {
            dispatch(updateCarKilometers(kilometerValue))
            changeDataSetInCollection(currentCar.name,
                date,
                parseFloat(power),
                kilometerValue,
                loadingStation,
                id
            )
            updateCarKilometer(currentCar.name, kilometerValue)
                .catch((error: Error) => {
                    console.error(error.message)
                })
            dispatch(setModalStateNone())
            setModalToDefault()
        } else
            alert('Invalid Data')
    }

    const onKilometerChange = (e: ChangeEvent<HTMLInputElement>) => {
        const currentKilometerValue = parseIntegerOrNull(e.target.value)
        if (currentKilometerValue !== null && currentKilometerValue > 0)
            dispatch(setKilometer(currentKilometerValue.toString()))
        else
            dispatch(setKilometer(''))
        if (isKilometerValid({
            kilometer: currentKilometerValue?.toString() ?? "",
            isChangingData: changingData,
            prevKilometers,
            currentCarKilometer: currentCar.kilometer
        })) {
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

    const onLoadingStationChangeHandler = (value: string, key?: string) => {
        if (!key) {
            return
        }
        const selectedLoadingStation = loadingStations.filter((loadingStation => loadingStation.id === key))[0]
        dispatch(setLoadingStation(selectedLoadingStation))
    }

    return (
        <Modal
            formName={`${ModalState.AddCarData}`}
            title={changingData ? de.buttonLabels.changeData : de.buttonLabels.addData}
            contentAutoHeight={true}
        >
            <div className={styles.mainContainer}>
                <div className={styles.selectRow}>
                    <div className={styles.selectField}>
                        <CustomSelect
                            onChange={onLoadingStationChangeHandler}
                            defaultValue={changingData ? language.loadingStation[`${loadingStation.name}`] : language.loadingStation[`${DEFAULT_LOADING_STATION.name}`]}
                            options={loadingStations.map((item) => language.loadingStation[`${item.name}`])}
                            keys={loadingStations.map((item) => item.id)}
                            style={{width: "100%"}}
                        />
                    </div>
                </div>

                <span className={styles.sectionLabel}>{de.inputLabels.kilometer}</span>
                <div className={`${styles.inputRow} ${isInputValid.kilometer ? styles.inputValid : styles.inputInvalid}`}>
                    <FontAwesomeIcon className={styles.leadingIcon} icon={faCarSide}/>
                    <input
                        data-testid={"add-data-kilometer-input"}
                        value={kilometer}
                        className={styles.innerInput}
                        type={"number"}
                        min={currentCar.kilometer !== undefined ? changingData ? prevKilometers + 1 : currentCar.kilometer : currentCar.kilometer}
                        max={999999}
                        step={1.0}
                        onChange={onKilometerChange}
                        placeholder={de.inputLabels.kilometer}
                    />
                </div>

                <span className={styles.sectionLabel}>{de.inputLabels.power}</span>
                <div className={`${styles.inputRow} ${isInputValid.power ? styles.inputValid : styles.inputInvalid}`}>
                    <FontAwesomeIcon className={styles.leadingIcon} icon={faBolt}/>
                    <input
                        data-testid={"add-data-power-input"}
                        value={power}
                        className={styles.innerInput}
                        type={"number"}
                        min={0.1}
                        max={99.9}
                        step={0.1}
                        placeholder={de.inputLabels.power}
                        onChange={powerOnChangeHandler}
                    />
                </div>

                <div className={styles.submitArea}>
                    <button
                        type={"button"}
                        className={styles.submitButton}
                        onClick={changingData ? onChangeDataClickHandler : onAddDataClickHandler}
                        disabled={disabled}
                    >
                        {changingData ? de.buttonLabels.changeData : de.buttonLabels.addData}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export type AddDataModalProps = {
    prevKilometers: number
}

