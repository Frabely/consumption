'use client'

import de from '../../constants/de.json'
import {useDispatch} from "react-redux";
import Modal from "@/components/layout/Modal";
import {NumberDictionary, Room} from "@/constants/types";
import styles from "@/styles/modals/AddFloorData.module.css";
import globalStyles from "@/styles/GlobalStyles.module.css";
import {closeIsAddingFloorDataModalActive} from "@/store/reducer/isAddingFloorDataModalActive";
import {ChangeEvent, useState} from "react";
import {EMPTY_ROOM} from "@/constants/constantData";
import {faSave} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import FieldInput from "@/components/layout/FieldInput";

export default function AddFloorData({floorNameParam, rooms}: AddFloorDataModalProps) {
    const dispatch = useDispatch()
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth()+1
    const monthString : string = month < 10 ? `0` + month : month.toString()

    const [floorName, setFloorName] = useState(floorNameParam ? floorNameParam : "")
    const [dynamicRooms, setDynamicRooms] = useState(rooms.length > 0 ? rooms : [EMPTY_ROOM])
    const [currentRoom, setCurrentRoom] = useState(dynamicRooms[0])
    const [currentFieldPairs, setCurrentFieldPairs] = useState(Object.entries(currentRoom.fields))

    const [currentDateValue, setCurrentDateValue] = useState({
        year: year.toString(),
        month: monthString
    })


    const onFieldPairValueChange = (event: ChangeEvent<HTMLInputElement>, key: string) => {
        const currentFieldValue: number = parseInt(event.target.value)
        let fieldPairs: NumberDictionary = {...currentRoom.fields}
        let currentDynamicRooms = [...dynamicRooms]
        let newDynRooms = currentDynamicRooms.filter((room) => room.name !== currentRoom.name)
        fieldPairs[`${key}`] = 0
        let newRoom: Room = {
            name: currentRoom.name,
            fields: fieldPairs
        }
        if (currentFieldValue && currentFieldValue > 0) {
            fieldPairs[`${key}`] = currentFieldValue
            newRoom.fields = fieldPairs
            newDynRooms.push(newRoom)
            setDynamicRooms(newDynRooms)
            setCurrentRoom(newRoom)
            setCurrentFieldPairs(Object.entries(newRoom.fields))
        } else {
            // setCurrentRoom(newRoom)
            // setDynamicRooms(newDynRooms)
            // setCurrentFieldPairs(Object.entries(newRoom.fields))
        }
    }

    const onSaveFieldClickHandler = (key: string) => {
    }

    const onAbortClickHandler = () => {
        dispatch(closeIsAddingFloorDataModalActive())
    }

    const onRoomChangeHandler = (event: ChangeEvent<HTMLSelectElement>) => {
        const selectedRoom = dynamicRooms.filter(room => room.name === event.target.value)[0]
        const fieldPairs = Object.entries(selectedRoom.fields)
        setCurrentRoom(selectedRoom)
        setCurrentFieldPairs(fieldPairs)
    }

    const onAddDataClickHandler = (event: any) => {
        event.preventDefault()
    }

    const onDateInputChangeHandler = (event: any) => {

    }

    return (
        <Modal formName={'addFloorData'}>
            <div>{floorName}</div>
            <input onChange={onDateInputChangeHandler} value={`${currentDateValue.year}-${currentDateValue.month}`}
                   className={globalStyles.monthPicker} type={"month"}/>
            <select onChange={onRoomChangeHandler} defaultValue={currentRoom.name}
                    className={styles.select}>
                {dynamicRooms.map((room) => {
                    return (<option key={room.name}>{room.name}</option>)
                })}
            </select>
            {currentFieldPairs.map(([key, value]: [string, number | null], index: number) =>
                <div key={index}>
                    <p>{key}:</p>
                    <div className={styles.inputContainer}>
                        <FieldInput/>
                        <div onClick={() => {
                            onSaveFieldClickHandler(key)
                        }}>
                            <FontAwesomeIcon icon={faSave}/>
                        </div>
                    </div>

                </div>
            )}
            <button onClick={onAddDataClickHandler} className={styles.button}>{de.buttonLabels.addData}</button>
            <button onClick={onAbortClickHandler} className={styles.button}>{de.buttonLabels.abort}</button>
        </Modal>
    );
}

export type AddFloorDataModalProps = {
    rooms: Room[],
    floorNameParam?: string
}
