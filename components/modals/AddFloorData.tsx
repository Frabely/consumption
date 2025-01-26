'use client'

import de from '../../constants/de.json'
import {useSelector} from "react-redux";
import Modal from "@/components/layout/Modal";
import {FieldValue, Flat, Room} from "@/constants/types";
import styles from "@/styles/modals/AddFloorData.module.css";
import globalStyles from "@/styles/GlobalStyles.module.css";
import {ChangeEvent, CSSProperties, useEffect, useState} from "react";
import {faSave} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import FieldInput from "@/components/layout/FieldInput";
import {getFieldValues, setFieldValue} from "@/firebase/functions";
import {RootState} from "@/store/store";
import CustomSelect from "@/components/layout/CustomSelect";
import {ModalState} from "@/constants/enums";

export default function AddFloorData({flat}: AddFloorDataModalProps) {

    const filterFieldValues = (flat: Flat, currentRoomId: string, allFieldValues: FieldValue[]) => {
        const currentFieldValues: FieldValue[] = []
        flat.rooms.filter(room => currentRoomId === room.id)[0].fields.map((field) => {
            let currentFieldValue: FieldValue = {field}
            allFieldValues.map((fieldValue) => {
                if (fieldValue.field.id === field.id) {
                    currentFieldValue.value = fieldValue.value;
                }
            })
            currentFieldValues.push(currentFieldValue)
        })
        return currentFieldValues
    }

    const state: RootState = useSelector((state: RootState) => state)
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const monthString: string = month < 10 ? `0` + month : month.toString()
    const [currentRoom, setCurrentRoom] = useState<Room>(flat.rooms[0])
    const [currentDateValue, setCurrentDateValue] = useState({
        year: year.toString(),
        month: monthString
    })
    const cleanInputRegEx: RegExp = /[^0-9.]|\.(?=.*\.)/g
    const [allFieldValues, setAllFieldValues] = useState<FieldValue[]>([])
    const [currentFieldValues, setCurrentFieldValues] = useState<FieldValue[]>([])

    useEffect(() => {
        getFieldValues(
            currentDateValue.year,
            currentDateValue.month,
            flat).then((result) => {
            if (result) {
                setAllFieldValues(result)
                setCurrentFieldValues(filterFieldValues(flat, currentRoom.id, result))
            }
        }).catch((error) => {
            console.log(error.message)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDateValue]);

    const onFieldPairValueChange = (value: string, id: string) => {
        const fieldValues = [...currentFieldValues]
        fieldValues.map((fieldValue) => {
            if (fieldValue.field.id === id) {
                fieldValue.value = parseFloat(value.replace(cleanInputRegEx, ''))
            }
        })
        setCurrentFieldValues(fieldValues)
    }

    const onSaveFieldClickHandler = async (fieldValue: FieldValue) => {
        setFieldValue(
            state.currentHouse.name,
            flat,
            currentRoom,
            fieldValue.field,
            currentDateValue.year,
            currentDateValue.month,
            fieldValue.value)
            .then(() => {
                alert(de.messages.fieldSaved
                    .replace("{valueFieldName}", fieldValue.field.name)
                    .replace("{valueNumber}", fieldValue.value ? fieldValue.value.toString() : "undefined"))
            })
    }

    const onRoomChangeHandler = (value: string) => {
        const changedRoom = flat.rooms.filter(room => room.name === value)[0]
        setCurrentRoom(changedRoom)
        setCurrentFieldValues(filterFieldValues(flat, changedRoom.id, allFieldValues))
    }

    const onDateInputChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        event.preventDefault()
        console.log(event.target.value.split("-")[0], event.target.value.split("-")[1])
        setCurrentDateValue({
            year: event.target.value.split("-")[0],
            month: event.target.value.split("-")[1]
        })
    }

    return (
        <Modal formName={`${ModalState.AddFloorData}`}>
            <div className={styles.mainContainer}
                 style={state.dimension.isHorizontal ? {height: '100%'} : {height: '75dvh'}}>
                <h1 className={styles.flatName}>{flat.name}</h1>
                <input onChange={onDateInputChangeHandler} value={`${currentDateValue.year}-${currentDateValue.month}`}
                       className={globalStyles.monthPicker} type={"month"}/>
                <CustomSelect
                    onChange={onRoomChangeHandler}
                    defaultValue={currentRoom.name}
                    options={flat.rooms.map((room) => room.name)}
                    style={{width: "100%"}}
                />
                {currentFieldValues.map((fieldValue, index: number) => {
                        return <div className={styles.inputContainer} key={index}>
                            <p className={styles.fieldLabel}>{fieldValue.field.name}:</p>
                            <div className={styles.fieldInputContainer}>
                                <FieldInput
                                    value={fieldValue.value?.toString()}
                                    onChange={(event) => {
                                        onFieldPairValueChange(event.target.value, fieldValue.field.id)
                                    }}
                                    placeholder={de.inputLabels.placeholderValue}
                                    style={{width: "13rem"}}
                                />
                                <div onClick={() => {
                                    if (fieldValue.value && fieldValue.value > 0)
                                        onSaveFieldClickHandler(fieldValue).catch(error => console.log(error))
                                }}>
                                    <FontAwesomeIcon
                                        style={
                                            {
                                                '--text-color': fieldValue.value && fieldValue.value > 0 ?
                                                    "var(--text-color)" :
                                                    "var(--text-color-muted)"
                                            } as CSSProperties
                                        }
                                        icon={faSave}/>
                                </div>
                            </div>
                        </div>
                    }
                )}
            </div>
        </Modal>
    );
}

export type AddFloorDataModalProps = {
    flat: Flat
}
