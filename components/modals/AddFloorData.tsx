'use client'

import de from '../../constants/de.json'
import Modal from "@/components/layout/Modal";
import {FieldValue, Flat, Room} from "@/constants/types";
import styles from "@/styles/modals/AddFloorData.module.css";
import globalStyles from "@/styles/GlobalStyles.module.css";
import {ChangeEvent, CSSProperties, useEffect, useState} from "react";
import {faSave, faBan} from "@fortawesome/free-solid-svg-icons";
import {CSSVariables, FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import FieldInput from "@/components/layout/FieldInput";
import {deleteFieldValue, getFieldValues, setFieldValue} from "@/firebase/functions";
import CustomSelect from "@/components/layout/CustomSelect";
import {ModalState} from "@/constants/enums";
import {useAppSelector} from "@/store/hooks";
import {selectCurrentHouse} from "@/store/selectors";
import {filterFieldValuesByRoom, parseYearMonthInput} from "@/domain/fieldValueMapping";

export default function AddFloorData({flat}: AddFloorDataModalProps) {
    const currentHouse = useAppSelector(selectCurrentHouse)
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const monthString: string = month < 10 ? `0` + month : month.toString()
    const [currentRoom, setCurrentRoom] = useState<Room>(flat.rooms[0])
    const [currentDateValue, setCurrentDateValue] = useState({
        year: year.toString(),
        month: monthString
    })
    const [allFieldValues, setAllFieldValues] = useState<FieldValue[]>([])
    const [currentFieldValues, setCurrentFieldValues] = useState<FieldValue[]>([])

    useEffect(() => {
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
        })
    }, [currentDateValue, currentRoom, flat]);

    const onFieldPairValueChange = (value: string, id: string) => {
        const fieldValues = [...currentFieldValues]
        fieldValues.map((fieldValue) => {
            if (fieldValue.field.id === id) {
                fieldValue.value = value
            }
        })
        setCurrentFieldValues(fieldValues)
    }

    const onSaveFieldClickHandler = async (fieldValue: FieldValue) => {
        if (fieldValue.value && !isNaN(Number(fieldValue.value))) {
            setFieldValue(
                currentHouse.name,
                flat,
                currentRoom,
                fieldValue.field,
                currentDateValue.year,
                currentDateValue.month,
                Number(fieldValue.value))
                .then(() => {
                    alert(de.messages.fieldSaved
                        .replace("{valueFieldName}", fieldValue.field.name)
                        .replace("{valueNumber}", fieldValue.value ? fieldValue.value.toString() : "undefined"))
                })
        }
    }

    const onDeleteFieldClickHandler = async (fieldValueToDelete: FieldValue) => {
        if (fieldValueToDelete.value !== null) {
            const fieldValues = [...currentFieldValues]
            fieldValues.map((field) => {
                if (field.field.id === fieldValueToDelete.field.id) {
                    fieldValueToDelete.value = null
                }
            })
            setCurrentFieldValues(fieldValues)
            deleteFieldValue(
                currentHouse.name,
                flat,
                currentRoom,
                fieldValueToDelete.field,
                currentDateValue.year,
                currentDateValue.month)
                .catch((ex) => console.error(ex))
        }
    }

    const onRoomChangeHandler = (value: string) => {
        const changedRoom = flat.rooms.filter(room => room.name === value)[0]
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
                {currentFieldValues.map((fieldValue, index: number) => {
                    const isValueValid = !!fieldValue.value && !isNaN(Number(fieldValue.value))
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
