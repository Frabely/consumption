'use client'

import de from '../../constants/de.json'
import {useDispatch} from "react-redux";
import Modal from "@/components/layout/Modal";
import {NumberDictionary, Room} from "@/constants/types";
import styles from "@/styles/modals/AddFloorData.module.css";
import {closeIsAddingFloorDataModalActive} from "@/store/reducer/isAddingFloorDataModalActive";
import {ChangeEvent, useState} from "react";
import {EMPTY_ROOM} from "@/constants/constantData";

export default function AddFloorData({isAddingFloorItem, floorNameParam, rooms}: AddFloorDataModalProps) {
    const dispatch = useDispatch()
    const [floorName, setFloorName] = useState(floorNameParam ? floorNameParam : "")
    const [dynamicRooms, setDynamicRooms] = useState(rooms.length > 0 ? rooms : [EMPTY_ROOM])
    const [currentRoom, setCurrentRoom] = useState(dynamicRooms[0])
    const [currentFieldPairs, setCurrentFieldPairs] = useState(Object.entries(currentRoom.fields))


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

    const onAbortClickHandler = () => {
        dispatch(closeIsAddingFloorDataModalActive())
    }

    const onRoomChangeHandler = (event: ChangeEvent<HTMLSelectElement>) => {
        const selectedRoom = dynamicRooms.filter(room => room.name === event.target.value)[0]
        const fieldPairs = Object.entries(selectedRoom.fields)
        setCurrentRoom(selectedRoom)
        setCurrentFieldPairs(fieldPairs)
    }

    const onAddDataClickHandler = () => {
        if (true) {

        } else
            alert('Invalid Data')
    }

    return (
        <Modal formName={'addFloorData'}>
            {isAddingFloorItem ?
                <input value={floorName}
                       className={`${styles.input} ${true ? styles.inputValid : styles.inputInvalid}`}
                       type={"text"}
                       onChange={(e) => {
                           setFloorName(e.target.value)
                       }}
                       placeholder={de.inputLabels.kilometer}
                /> :
                <div className={styles.input}>{floorName}</div>}
            <select onChange={onRoomChangeHandler} defaultValue={currentRoom.name}
                    className={styles.select}>
                {dynamicRooms.map((room) => {
                    return (<option key={room.name}>{room.name}</option>)
                })}
            </select>
            {currentFieldPairs.map(([key], index) =>
                <input value={currentRoom.fields[`${key}`] ? currentRoom.fields[`${key}`] : 0}
                       className={`${styles.input} ${true ? styles.inputValid : styles.inputInvalid}`}
                       type={"number"}
                       min={0}
                       max={999999}
                       step={1.0}
                       onChange={(event) => {
                           onFieldPairValueChange(event, key)
                       }}
                       placeholder={key}
                       key={index}
                />
            )}
            <button onClick={onAddDataClickHandler} className={styles.button}>{de.buttonLabels.addData}</button>
            <button onClick={onAbortClickHandler} className={styles.button}>{de.buttonLabels.abort}</button>
        </Modal>
    );
}

export type AddFloorDataModalProps = {
    isAddingFloorItem: boolean,
    rooms: Room[],
    floorNameParam?: string
}
