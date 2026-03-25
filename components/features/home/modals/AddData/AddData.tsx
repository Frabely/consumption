'use client'

import styles from "./AddData.module.css"
import de from '@/i18n'
import {setModalStateNone} from "@/store/reducer/modalState";
import {setKilometer} from "@/store/reducer/modal/kilometer";
import {setPower} from "@/store/reducer/modal/power";
import {addDataSetToCollection, changeDataSetInCollection, updateCarKilometer} from "@/firebase/functions";
import {setIsChangingData} from "@/store/reducer/isChangingData";
import {ChangeEvent, useCallback, useEffect, useRef, useState} from "react";
import Modal from "@/components/shared/overlay/Modal";
import {ensureCarsLoaded, loadingStations} from "@/constants/constantData";
import {setLoadingStation} from "@/store/reducer/modal/loadingStationId";
import {setStarted} from "@/store/reducer/modal/started";
import {setEnded} from "@/store/reducer/modal/ended";
import {setCardId} from "@/store/reducer/modal/cardId";
import type {Translations} from "@/i18n/types";
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
    selectCardId,
    selectDate,
    selectEnded,
    selectId,
    selectIsChangingData,
    selectKilometer,
    selectLoadingStation,
    selectModalState,
    selectPower,
    selectStarted
} from "@/store/selectors";
import {isKilometerValid, isPowerValid, parseIntegerOrNull} from "@/utils/validation/carDataValidation";
import {setIsLoading} from "@/store/reducer/isLoading";
import {
    getLatestCarportWallboxSession,
    getLatestEntranceWallboxSession
} from "@/services/wallboxService";
import {resolveUserDefaultLoadingStation} from "@/utils/loadingStations/defaultLoadingStation";
import {
    resolveAddDataLoadingStations,
    resolvePersistedLoadingSessionRange,
    resolveWallboxApiStation,
    resolveWallboxPowerPrefill
} from "@/components/features/home/modals/AddData/AddData.logic";

const POWER_INPUT_STEP = 0.0001

/**
 * Renders the add/change data modal and coordinates wallbox-based prefills.
 * @param props Modal props.
 * @returns Rendered add/change data modal.
 */
export default function AddData({prevKilometers}: AddDataModalProps) {
    const language: Translations = de
    const dispatch = useAppDispatch()
    const modalState = useAppSelector(selectModalState)
    const currentCar = useAppSelector(selectCurrentCar)
    const currentUser = useAppSelector(selectCurrentUser)
    const kilometer = useAppSelector(selectKilometer)
    const power = useAppSelector(selectPower)
    const loadingStation = useAppSelector(selectLoadingStation)
    const id = useAppSelector(selectId)
    const date = useAppSelector(selectDate)
    const started = useAppSelector(selectStarted)
    const ended = useAppSelector(selectEnded)
    const cardId = useAppSelector(selectCardId)
    const changingData = useAppSelector(selectIsChangingData)
    const selectableStations = resolveAddDataLoadingStations(loadingStations)
    const initialLoadingStation = resolveUserDefaultLoadingStation({
        user: currentUser,
        availableLoadingStations: selectableStations
    })
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
    const hasInitializedAddModalRef = useRef(false)
    const activeWallboxRequestRef = useRef<AbortController | null>(null)
    const rememberedWallboxPowerRef = useRef<string | undefined>(undefined)
    const getLoadingStationLabel = (stationName: string): string =>
        language.loadingStation[stationName as keyof typeof language.loadingStation] ?? stationName;

    /**
     * Aborts the currently active wallbox request when present.
     * @returns No return value.
     */
    const abortActiveWallboxRequest = useCallback((): void => {
        if (activeWallboxRequestRef.current) {
            activeWallboxRequestRef.current.abort()
            activeWallboxRequestRef.current = null
        }
        dispatch(setIsLoading(false))
    }, [dispatch])

    /**
     * Clears the remembered wallbox power value used for timestamp validation.
     * @returns No return value.
     */
    const clearRememberedWallboxPower = useCallback((): void => {
        rememberedWallboxPowerRef.current = undefined
    }, [])

    /**
     * Clears wallbox-derived modal fields and keeps manual entry available.
     * @returns No return value.
     */
    const resetWallboxPrefill = useCallback((): void => {
        abortActiveWallboxRequest()
        clearRememberedWallboxPower()
        dispatch(setPower(''))
        dispatch(setStarted(undefined))
        dispatch(setEnded(undefined))
        dispatch(setCardId(undefined))
        dispatch(setIsLoading(false))
        setIsInputValid((currentValidity) => ({
            ...currentValidity,
            power: false
        }))
    }, [abortActiveWallboxRequest, clearRememberedWallboxPower, dispatch])

    /**
     * Fetches the latest wallbox session for the selected station.
     * @param wallboxStation Station slug supported by the wallbox API.
     * @param signal Optional abort signal used to cancel the request.
     * @returns Latest wallbox session for the selected station.
     */
    const fetchWallboxSession = async (
        wallboxStation: "entrance" | "carport",
        signal?: AbortSignal
    ) => {
        if (wallboxStation === "entrance") {
            return getLatestEntranceWallboxSession(signal)
        }

        return getLatestCarportWallboxSession(signal)
    }

    /**
     * Fetches and applies the latest wallbox session for a loading station.
     * @param nextLoadingStation Loading station used to resolve the wallbox endpoint.
     * @returns Promise resolved when the prefill attempt is complete.
     */
    const runWallboxPrefill = useCallback(async (
        nextLoadingStation: typeof loadingStation
    ): Promise<void> => {
        const wallboxStation = resolveWallboxApiStation(nextLoadingStation)
        if (!wallboxStation) {
            resetWallboxPrefill()
            return
        }

        abortActiveWallboxRequest()
        const abortController = new AbortController()
        activeWallboxRequestRef.current = abortController
        dispatch(setIsLoading(true))

        try {
            const latestSession = await fetchWallboxSession(wallboxStation, abortController.signal)
            if (activeWallboxRequestRef.current !== abortController) {
                return
            }

            const nextPrefilledPower = resolveWallboxPowerPrefill(latestSession)
            rememberedWallboxPowerRef.current = nextPrefilledPower
            dispatch(setPower(nextPrefilledPower))
            dispatch(setStarted(latestSession.started))
            dispatch(setEnded(latestSession.ended))
            dispatch(setCardId(latestSession.cardId))
            setIsInputValid((currentValidity) => ({
                ...currentValidity,
                power: true
            }))
        } catch (error) {
            if (abortController.signal.aborted) {
                return
            }

            resetWallboxPrefill()
        } finally {
            if (activeWallboxRequestRef.current === abortController) {
                activeWallboxRequestRef.current = null
                dispatch(setIsLoading(false))
            }
        }
    }, [abortActiveWallboxRequest, dispatch, resetWallboxPrefill])

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
            if (!selectedCar) {
                dispatch(setKilometer(""))
                return
            }

            dispatch(setCurrentCar(selectedCar))
            if (selectedCar.kilometer !== undefined) {
                dispatch(setKilometer(selectedCar.kilometer.toString()))
            }
        }

        void hydrateCurrentCarForModal()
    }, [currentCar.kilometer, currentCar.name, currentUser.defaultCar, dispatch, modalState])

    useEffect(() => {
        if (modalState !== ModalState.AddCarData) {
            hasInitializedAddModalRef.current = false
            clearRememberedWallboxPower()
            abortActiveWallboxRequest()
            return
        }

        if (hasInitializedAddModalRef.current) {
            return
        }
        hasInitializedAddModalRef.current = true

        clearRememberedWallboxPower()
        if (currentCar.kilometer !== undefined) {
            dispatch(setKilometer(currentCar.kilometer.toString()));
        }
        dispatch(setIsChangingData(false));
        dispatch(setLoadingStation(initialLoadingStation));
        dispatch(setStarted(undefined))
        dispatch(setEnded(undefined))
        dispatch(setCardId(undefined))
        dispatch(setPower(""))
        setIsInputValid({
            kilometer: false,
            power: false
        });
        void runWallboxPrefill(initialLoadingStation)
    }, [abortActiveWallboxRequest, clearRememberedWallboxPower, currentCar.kilometer, dispatch, initialLoadingStation, modalState, runWallboxPrefill]);

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

    /**
     * Restores the modal state to its default add-data values.
     * @returns No return value.
     */
    const setModalToDefault = (): void => {
        clearRememberedWallboxPower()
        dispatch(setPower(''))
        if (currentCar.kilometer !== undefined)
            dispatch(setKilometer(currentCar.kilometer.toString()))
        dispatch(setIsChangingData(false))
        dispatch(setLoadingStation(initialLoadingStation))
        dispatch(setStarted(undefined))
        dispatch(setEnded(undefined))
        dispatch(setCardId(undefined))
        setIsInputValid({
            kilometer: false,
            power: false
        })
    }

    /**
     * Refreshes wallbox-derived modal values for the selected station.
     * @param nextLoadingStation Newly selected loading station.
     * @returns Promise resolved when the prefill attempt is complete.
     */
    async function refreshWallboxPrefill(nextLoadingStation: typeof loadingStation): Promise<void> {
        try {
            await runWallboxPrefill(nextLoadingStation)
        } catch {
            // Request errors already reset the prefill state; keep the dialog usable.
        }
    }

    /**
     * Persists a new charging data set for the current car.
     * @returns Promise resolved when the add flow completes.
     */
    const onAddDataClickHandler = async () => {
        const kilometerValue = parseIntegerOrNull(kilometer)
        if (currentCar.kilometer !== undefined && currentCar.name && kilometerValue !== null && currentCar.kilometer < kilometerValue) {
            const loadingSessionRange = resolvePersistedLoadingSessionRange({
                rememberedPower: rememberedWallboxPowerRef.current,
                currentPower: power,
                started,
                ended,
                cardId
            })
            dispatch(setIsLoading(true))
            const dateNow = new Date()
            dispatch(setDate(dateNow))
            const carKilometersPreUpdate = currentCar.kilometer
            dispatch(updateCarPrevKilometers(carKilometersPreUpdate))
            dispatch(updateCarKilometers(kilometerValue))
            try {
                await addDataSetToCollection(currentCar.name, {
                    date: dateNow,
                    kilometer: kilometerValue,
                    power: parseFloat(power),
                    name: currentUser.name ? currentUser.name : '',
                    loadingStation,
                    ...loadingSessionRange
                })
                await updateCarKilometer(currentCar.name, kilometerValue, carKilometersPreUpdate)
                dispatch(setModalStateNone())
                setModalToDefault()
            } catch (error) {
                console.error(error)
            } finally {
                dispatch(setIsLoading(false))
            }
        } else
            alert('Invalid Data')
    }

    /**
     * Persists changes for an existing charging data set.
     * @returns Promise resolved when the change flow completes.
     */
    const onChangeDataClickHandler = async () => {
        const kilometerValue = parseIntegerOrNull(kilometer)
        if (currentCar.kilometer !== undefined && currentCar.name && currentCar.prevKilometer !== undefined && kilometerValue !== null && currentCar.prevKilometer < kilometerValue) {
            const loadingSessionRange = resolvePersistedLoadingSessionRange({
                rememberedPower: rememberedWallboxPowerRef.current,
                currentPower: power,
                started,
                ended,
                cardId
            })
            dispatch(setIsLoading(true))
            dispatch(updateCarKilometers(kilometerValue))
            try {
                await changeDataSetInCollection(currentCar.name, {
                    date,
                    power: parseFloat(power),
                    kilometer: kilometerValue,
                    loadingStation,
                    id,
                    ...loadingSessionRange
                })
                await updateCarKilometer(currentCar.name, kilometerValue)
                dispatch(setModalStateNone())
                setModalToDefault()
            } catch (error) {
                console.error(error)
            } finally {
                dispatch(setIsLoading(false))
            }
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
        const selectedLoadingStation = selectableStations.filter((loadingStation => loadingStation.id === key))[0]
        if (!selectedLoadingStation) {
            return
        }
        dispatch(setLoadingStation(selectedLoadingStation))
        if (!changingData) {
            void refreshWallboxPrefill(selectedLoadingStation)
        }
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
                            defaultValue={getLoadingStationLabel(loadingStation.name)}
                            options={selectableStations.map((item) => getLoadingStationLabel(item.name))}
                            keys={selectableStations.map((item) => item.id)}
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
                        step={POWER_INPUT_STEP}
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



