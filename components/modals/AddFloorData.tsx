'use client'

import de from '../../constants/de.json'
import { useSelector} from "react-redux";
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

export default function AddFloorData({flatName, rooms}: AddFloorDataModalProps) {
    const state: RootState = useSelector((state: RootState) => state)
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth()+1
    const monthString : string = month < 10 ? `0` + month : month.toString()
    const [currentRoom, setCurrentRoom] = useState<Room>(rooms[0])
    const [currentDateValue, setCurrentDateValue] = useState({
        year: year.toString(),
        month: monthString
    })

    useEffect(() => {
        getFieldValues(
            currentDateValue.year,
            currentDateValue.month,
            state.currentHouse.name,
            flatName,
            currentRoom.name).then((result) => {

                if (result) {
                    const fields: NumberDictionary = {...currentRoom.fields}
                    Object.entries(result).map(([key, value]) => {
                        const newKey = key.split("#").pop();
                        fields[`${newKey}`] = value
                    })
                    const newRoom: Room = {name: currentRoom.name, fields: fields}
                    setCurrentRoom(newRoom)
                }
            })
    }, [currentDateValue.month, currentDateValue.year, currentRoom.name, flatName, state.currentHouse.name]);


    const onFieldPairValueChange = (value: string, key: string) => {
        const currentFieldValue: number = parseInt(value.replace(/\D/g, ''))
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
                alert("saved")
            })
    }

    const onRoomChangeHandler = (value: string) => {
        const selectedRoom = rooms.filter(room => room.name === value)[0]
        setCurrentRoom(selectedRoom)
    }

    const onDateInputChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        event.preventDefault()
        setCurrentDateValue({
            year: event.target.value.split("-")[0],
            month: event.target.value.split("-")[1]
        })
    }

    return (
        <Modal formName={'addFloorData'}>
            <div>{flatName}</div>
            <input onChange={onDateInputChangeHandler} value={`${currentDateValue.year}-${currentDateValue.month}`}
                   className={globalStyles.monthPicker} type={"month"}/>
            <CustomSelect
                onChange={onRoomChangeHandler}
                defaultValue={currentRoom.name}
                options={rooms.map((room) => room.name)}
                style={{width: "100%"}}
            />
            {Object.entries(currentRoom.fields).map(([key, value]: [string, number | null], index: number) => {
                return <div key={index}>
                        <p>{key}:</p>
                        <div className={styles.inputContainer}>
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
                                    style={{'--color-text': value && value > 0 ? "black" : "grey" } as CSSProperties}
                                    icon={faSave}/>
                            </div>
                        </div>
                    </div>
                }
            )}
        </Modal>
    );
}

export type AddFloorDataModalProps = {
    rooms: Room[],
    flatName: string
}
