'use client'

import de from '@/i18n'
import Modal from "@/components/shared/overlay/Modal";
import {FieldValue, Flat, Room, YearMonth} from "@/common/models";
import styles from "./AddFloorData.module.css";
import globalStyles from "@/styles/GlobalStyles.module.css";
import {ChangeEvent, CSSProperties, useEffect, useState} from "react";
import {faSave, faBan} from "@fortawesome/free-solid-svg-icons";
import {CSSVariables, FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import FieldInput from "@/components/shared/forms/FieldInput";
import {deleteFieldValue, getFieldValues, setFieldValue, setFieldValues} from "@/firebase/functions";
import CustomSelect from "@/components/shared/forms/CustomSelect";
import {ModalState} from "@/constants/enums";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {selectCurrentHouse} from "@/store/selectors";
import {filterFieldValuesByRoom, parseYearMonthInput} from "@/utils/building/fieldValueMapping";
import {
    isFieldValueValid,
    mapDachsValuesToFieldValues,
    mergeRoomFieldValues,
    resolveRoomByName,
    shouldShowDachsAutofill
} from "@/components/features/building/modals/AddFloorData/AddFloorData.logic";
import {MONTH_NUMBER_OFFSET} from "@/components/features/building/modals/AddFloorData/AddFloorData.constants";
import {setIsLoading} from "@/store/reducer/isLoading";
import {getDachsAutofillValues} from "@/services/dachsService";
import CustomButton from "@/components/shared/ui/CustomButton";
import {isSupportedDachsRoomName} from "@/common/dachs/dachsHouseConfig";

/**
 * Renders the building field value dialog for one flat and supports Dachs autofill for F233 and F235.
 * @param flat Selected flat whose room values are being managed.
 * @returns Building consumption modal for the selected flat.
 */
export default function AddFloorData({flat}: AddFloorDataModalProps) {
    const currentHouse = useAppSelector(selectCurrentHouse)
    const dispatch = useAppDispatch()
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + MONTH_NUMBER_OFFSET
    const monthString: string = month < 10 ? `0` + month : month.toString()
    const [currentRoom, setCurrentRoom] = useState<Room>(flat.rooms[0])
    const [currentDateValue, setCurrentDateValue] = useState<YearMonth>({
        year: year.toString(),
        month: monthString
    })
    const [allFieldValues, setAllFieldValues] = useState<FieldValue[]>([])
    const [currentFieldValues, setCurrentFieldValues] = useState<FieldValue[]>([])
    const [pendingImportedFieldIds, setPendingImportedFieldIds] = useState<string[]>([])
    const [isAutofillNoticeVisible, setIsAutofillNoticeVisible] = useState(false)
    const isDachsAutofillVisible = shouldShowDachsAutofill(currentRoom)

    useEffect(() => {
        dispatch(setIsLoading(true))
        getFieldValues(
            currentDateValue.year,
            currentDateValue.month,
            flat).then((result) => {
            if (result) {
                setAllFieldValues(result)
                setCurrentFieldValues(filterFieldValuesByRoom(flat, currentRoom.id, result))
            }
        }).catch((error) => {
            console.error(error.message)
        }).finally(() => {
            dispatch(setIsLoading(false))
        })
    }, [currentDateValue, currentRoom, dispatch, flat]);

    useEffect(() => {
        setPendingImportedFieldIds([])
        setIsAutofillNoticeVisible(false)
    }, [currentDateValue, currentRoom])

    const synchronizeRoomFieldValues = (nextFieldValues: FieldValue[]) => {
        setCurrentFieldValues(nextFieldValues)
        setAllFieldValues((previousFieldValues) =>
            mergeRoomFieldValues(previousFieldValues, nextFieldValues, currentRoom))
    }

    const onFieldPairValueChange = (value: string, id: string) => {
        const nextFieldValues = currentFieldValues.map((fieldValue) =>
            fieldValue.field.id === id
                ? {...fieldValue, value}
                : fieldValue)
        synchronizeRoomFieldValues(nextFieldValues)
    }

    const onSaveFieldClickHandler = async (fieldValue: FieldValue) => {
        if (fieldValue.value && !isNaN(Number(fieldValue.value))) {
            dispatch(setIsLoading(true))
            try {
                await setFieldValue(
                    currentHouse.name,
                    flat,
                    currentRoom,
                    fieldValue.field,
                    currentDateValue.year,
                    currentDateValue.month,
                    Number(fieldValue.value))
                alert(de.messages.fieldSaved
                    .replace("{valueFieldName}", fieldValue.field.name)
                    .replace("{valueNumber}", fieldValue.value ? fieldValue.value.toString() : "undefined"))
            } finally {
                dispatch(setIsLoading(false))
            }
        }
    }

    const onDismissAutofillNoticeClickHandler = () => {
        setIsAutofillNoticeVisible(false)
    }

    const onSaveImportedFieldValuesClickHandler = async () => {
        const importedFieldValuesToSave = currentFieldValues.filter((fieldValue) =>
            pendingImportedFieldIds.includes(fieldValue.field.id) && isFieldValueValid(fieldValue.value))
        if (importedFieldValuesToSave.length === 0) {
            setPendingImportedFieldIds([])
            setIsAutofillNoticeVisible(false)
            return
        }

        dispatch(setIsLoading(true))
        try {
            await setFieldValues(
                currentHouse.name,
                flat,
                currentRoom,
                currentDateValue.year,
                currentDateValue.month,
                importedFieldValuesToSave.map((fieldValue) => ({
                    field: fieldValue.field,
                    value: Number(fieldValue.value)
                }))
            )
            setPendingImportedFieldIds([])
            setIsAutofillNoticeVisible(false)
            alert(de.messages.dachsAutofillSaved
                .replace("{valueCount}", importedFieldValuesToSave.length.toString()))
        } catch (error) {
            console.error(error)
            alert(de.messages.dachsAutofillFailed)
        } finally {
            dispatch(setIsLoading(false))
        }
    }

    const onDeleteFieldClickHandler = async (fieldValueToDelete: FieldValue) => {
        if (fieldValueToDelete.value !== null) {
            dispatch(setIsLoading(true))
            const nextFieldValues = currentFieldValues.map((fieldValue) =>
                fieldValue.field.id === fieldValueToDelete.field.id
                    ? {...fieldValue, value: null}
                    : fieldValue)
            synchronizeRoomFieldValues(nextFieldValues)
            try {
                await deleteFieldValue(
                    currentHouse.name,
                    flat,
                    currentRoom,
                    fieldValueToDelete.field,
                    currentDateValue.year,
                    currentDateValue.month)
            } catch (ex) {
                console.error(ex)
            } finally {
                dispatch(setIsLoading(false))
            }
        }
    }

    const onDachsAutofillClickHandler = async () => {
        if (!isSupportedDachsRoomName(currentRoom.name)) {
            return
        }
        dispatch(setIsLoading(true))
        try {
            const dachsValues = await getDachsAutofillValues(currentRoom.name)
            const {updatedFieldValues, importedFieldValues} =
                mapDachsValuesToFieldValues(currentFieldValues, dachsValues)

            synchronizeRoomFieldValues(updatedFieldValues)

            if (importedFieldValues.length === 0) {
                setPendingImportedFieldIds([])
                setIsAutofillNoticeVisible(false)
                return
            }

            setPendingImportedFieldIds(importedFieldValues.map((fieldValue) => fieldValue.field.id))
            setIsAutofillNoticeVisible(true)
        } catch (error) {
            console.error(error)
            alert(de.messages.dachsAutofillFailed)
        } finally {
            dispatch(setIsLoading(false))
        }
    }

    const onRoomChangeHandler = (value: string) => {
        const changedRoom = resolveRoomByName(flat.rooms, value)
        if (!changedRoom) {
            return
        }
        setCurrentRoom(changedRoom)
        setCurrentFieldValues(filterFieldValuesByRoom(flat, changedRoom.id, allFieldValues))
    }

    const onDateInputChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        event.preventDefault()
        const parsed = parseYearMonthInput(event.target.value)
        if (parsed) {
            setCurrentDateValue(parsed)
        }
    }

    return (
        <Modal formName={`${ModalState.AddFloorData}`} title={flat.name}>
            <div className={styles.mainContainer}>
                <input
                    onChange={onDateInputChangeHandler}
                    value={`${currentDateValue.year}-${currentDateValue.month}`}
                    className={`${globalStyles.monthPicker} ${styles.monthPicker}`}
                    type={"month"}
                />
                <CustomSelect
                    onChange={onRoomChangeHandler}
                    defaultValue={currentRoom.name}
                    options={flat.rooms.map((room) => room.name)}
                    style={{width: "100%"}}
                />
                {isDachsAutofillVisible ? (
                    <div className={styles.autofillButtonContainer}>
                        <CustomButton
                            type={"button"}
                            onClick={onDachsAutofillClickHandler}
                            label={de.buttonLabels.importDachsValues}
                            style={{width: "100%"}}
                        />
                    </div>
                ) : null}
                {isAutofillNoticeVisible ? (
                    <div className={styles.autofillNotice}>
                        <p className={styles.autofillNoticeTitle}>{de.messages.dachsAutofillPending}</p>
                        <p className={styles.autofillNoticeText}>{de.messages.dachsAutofillPendingHint}</p>
                        <div className={styles.autofillNoticeActions}>
                            <CustomButton
                                type={"button"}
                                onClick={onSaveImportedFieldValuesClickHandler}
                                label={de.buttonLabels.saveAllValues}
                            />
                            <button
                                type={"button"}
                                className={styles.autofillSecondaryButton}
                                onClick={onDismissAutofillNoticeClickHandler}
                            >
                                {de.buttonLabels.saveLaterIndividually}
                            </button>
                        </div>
                    </div>
                ) : null}
                {currentFieldValues.map((fieldValue, index: number) => {
                    const isValueValid = isFieldValueValid(fieldValue.value)
                    return (
                        <div
                            className={styles.inputContainer}
                            key={index}>
                            <p className={styles.fieldLabel}>{fieldValue.field.name}:</p>
                            <div className={styles.fieldInputContainer}>
                                <div className={styles.fieldInputWrapper}>
                                    <FieldInput
                                        value={fieldValue.value}
                                        onChange={(event) => {
                                            onFieldPairValueChange(event.target.value, fieldValue.field.id)
                                        }}
                                        placeholder={de.inputLabels.placeholderValue}
                                    />
                                </div>
                                <div
                                    className={`${styles.actionIconButton} ${isValueValid ? "" : styles.actionIconDisabled}`}
                                    onClick={() => {
                                        if (isValueValid) {
                                            onSaveFieldClickHandler(fieldValue).catch(error => console.error(error))
                                        }
                                    }}
                                >
                                    <FontAwesomeIcon
                                        style={
                                            {
                                                '--text-color': isValueValid ?
                                                    "var(--text-color)" :
                                                    "var(--text-color-muted)"
                                            } as CSSProperties & CSSVariables
                                        }
                                        icon={faSave}/>
                                </div>
                                <div
                                    className={`${styles.actionIconButton} ${isValueValid ? "" : styles.actionIconDisabled}`}
                                    onClick={() => {
                                        if (isValueValid) {
                                            onDeleteFieldClickHandler(fieldValue).catch(error => console.error(error))
                                        }
                                    }}
                                >
                                    <FontAwesomeIcon
                                        style={
                                            {
                                                '--text-color': isValueValid ?
                                                    "var(--text-color)" :
                                                    "var(--text-color-muted)"
                                            } as CSSProperties & CSSVariables
                                        }
                                        icon={faBan}/>
                                </div>
                            </div>
                        </div>
                    )
                }
                )}
            </div>
        </Modal>
    );
}

export type AddFloorDataModalProps = {
    flat: Flat
}




