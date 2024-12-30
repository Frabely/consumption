'use client'

import de from '../../constants/de.json'
import {useSelector} from "react-redux";
import Modal from "@/components/layout/Modal";
import {NumberDictionary, Room} from "@/constants/types";
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

export default function AddFloorData({flatName, rooms}: AddFloorDataModalProps) {
    const state: RootState = useSelector((state: RootState) => state)
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const monthString: string = month < 10 ? `0` + month : month.toString()
    const [currentRoom, setCurrentRoom] = useState<Room>(rooms[0])
    const [currentDateValue, setCurrentDateValue] = useState({
        year: year.toString(),
        month: monthString
    })
    const cleanInputRegEx: RegExp = /[^0-9.]|\.(?=.*\.)/g

    useEffect(() => {
        console.log(flatName)
        getFieldValues(
            currentDateValue.year,
            currentDateValue.month,
            state.currentHouse.name,
            flatName,
            currentRoom.name).then((result) => {
            if (result) {
                const fields: NumberDictionary = {...currentRoom.fields}
                Object.entries(fields).map(([key]) => {
                    fields[`${key}`] = null
                })
                Object.entries(result).map(([key, value]) => {
                    const newKey = key.split("#").pop();
                    fields[`${newKey}`] = value
                })
                const newRoom: Room = {name: currentRoom.name, fields: fields}
                setCurrentRoom(newRoom)
            }
        })
        // eslint-disable-next-line
    }, [currentDateValue, currentDateValue, currentRoom.name, flatName, state.currentHouse.name]);

    const onFieldPairValueChange = (value: string, key: string) => {
        const currentFieldValue: number = parseFloat(value.replace(cleanInputRegEx, ''))
        const fields: NumberDictionary = {...currentRoom.fields}
        fields[`${key}`] = currentFieldValue
        const newRoom: Room = {name: currentRoom.name, fields: fields}
        setCurrentRoom(newRoom)
    }

    const onSaveFieldClickHandler = async (key: string) => {
        setFieldValue(
            state.currentHouse.name,
            flatName,
            currentRoom.name,
            key,
            currentDateValue.year,
            currentDateValue.month,
            currentRoom.fields[`${key}`])
            .then(() => {
                // @ts-ignore
                const value = currentRoom.fields[`${key}`]
                alert(de.messages.fieldSaved
                    .replace("{valueFieldName}", key)
                    .replace("{valueNumber}", value ? value.toString() : "null"))
            })
    }

    const onRoomChangeHandler = (value: string) => {
        const selectedRoom = rooms.filter(room => room.name === value)[0]
        setCurrentRoom(selectedRoom)
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
                <h1 className={styles.flatName}>{flatName}</h1>
                <input onChange={onDateInputChangeHandler} value={`${currentDateValue.year}-${currentDateValue.month}`}
                       className={globalStyles.monthPicker} type={"month"}/>
                <CustomSelect
                    onChange={onRoomChangeHandler}
                    defaultValue={currentRoom.name}
                    options={rooms.map((room) => room.name)}
                    style={{width: "100%"}}
                />
                {Object.entries(currentRoom.fields).map(([key, value]: [string, number | null], index: number) => {
                        return <div className={styles.inputContainer} key={index}>
                            <p className={styles.fieldLabel}>{key}:</p>
                            <FieldInput
                                value={value?.toString()}
                                onChange={(event) => {
                                    onFieldPairValueChange(event.target.value, key)
                                }}
                                placeholder={de.inputLabels.placeholderValue}
                            />
                            <div onClick={() => {
                                if (value && value > 0)
                                    onSaveFieldClickHandler(key).catch(error => console.log(error))
                            }}>
                                <FontAwesomeIcon
                                    style={
                                        {
                                            '--text-color': value && value > 0 ?
                                                "var(--text-color)" :
                                                "var(--text-color-muted)"
                                        } as CSSProperties
                                    }
                                    icon={faSave}/>
                            </div>
                        </div>
                    }
                )}
            </div>
        </Modal>
    );
}

export type AddFloorDataModalProps = {
    rooms: Room[],
    flatName: string
}
