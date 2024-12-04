import React, {CSSProperties, useState} from 'react';
import {RootState} from "@/store/store";
import {useDispatch, useSelector} from "react-redux";
import Modal from "@/components/layout/Modal";
import styles from "@/styles/modals/AddFloor.module.css";
import de from "@/constants/de.json";
import {ChangingFloor, Flat, Room} from "@/constants/types";
import {createFlat} from "@/firebase/functions";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSave, faMinus} from "@fortawesome/free-solid-svg-icons";
import {setModalStateNone} from "@/store/reducer/isModalActive";

export default function AddFloor({changingFloorData}: AddFloorModalProps) {
    const state: RootState = useSelector((state: RootState) => state)
    const dispatch = useDispatch()
    const [flatName, setFlatName] = useState("")
    const [roomNameInput, setRoomNameInput] = useState("")
    const [rooms, setRooms] = useState<Room[]>(changingFloorData && changingFloorData?.rooms ? changingFloorData.rooms : [])
    const [fieldNameInput, setFieldNameInput] = useState("")
    const [currentSelectedRoom, setCurrentSelectedRoom] = useState<Room | undefined>()

    const onAddDataClickHandler = (event: any) => {
        event.preventDefault()
        const flat: Flat = {
            name: flatName,
            rooms: rooms
        }
        createFlat(flat, state.currentHouse.name).then(() => {
            dispatch(setModalStateNone())
        }).catch(error => {
            console.log(error)
        })
    }

    const onAddRoomClickHandler = (event: any) => {
        event.preventDefault()
        if (roomNameInput.length === 0) {
            alert(de.messages.fieldNameEmpty)
            return
        }
        const newRoom: Room = {
            name: roomNameInput,
            fields: {}
        }
        setRooms([...rooms, newRoom])
        setCurrentSelectedRoom(newRoom)
        setRoomNameInput("")
    }

    const onAddFieldClickHandler = (event: any) => {
        event.preventDefault()
        if (!currentSelectedRoom) {
            alert(de.messages.selectARoom)
            return
        }
        if (fieldNameInput.length === 0) {
            alert(de.messages.fieldNameEmpty)
            return
        }

        const newFields = currentSelectedRoom.fields
        newFields[`${fieldNameInput}`] = null
        const newRooms = rooms.filter((room) => room.name !== currentSelectedRoom.name)
        const newRoom: Room = {name: currentSelectedRoom.name, fields: newFields}
        newRooms.push(newRoom)
        setCurrentSelectedRoom(newRoom)
        setRooms(newRooms)
        setFieldNameInput("")
    }

    const handleRoomChange = (room: Room) => {
        setCurrentSelectedRoom(room)
    }

    const onRemoveRoomClickHandler = (room: Room) => {
        setRooms(rooms.filter((currentRoom) => currentRoom.name !== room.name))
        setCurrentSelectedRoom(undefined)
    }

    const onRemoveFieldClickHandler = (room: Room, key: string) => {
        const newFields = room.fields
        delete newFields[`${key}`]
        const newRooms = rooms.filter((currentRoom) => currentRoom.name !== room.name)
        newRooms.push({name: room.name, fields: newFields})
        setRooms(newRooms)
    }

    return (
        <Modal formName={changingFloorData ? 'addFloor' : 'changeFloor'}>
            {changingFloorData ?
                <p style={{marginBottom: '1rem'}}>{changingFloorData.flatName}</p>
                :
                <input value={flatName}
                       className={`${styles.input} ${flatName.length !== 0 ? styles.inputValid : styles.inputInvalid}`}
                       type={"text"}
                       onChange={(e) => {
                           setFlatName(e.target.value)
                       }}
                       placeholder={de.inputLabels.flatName}
                       style={{marginBottom: '1rem'}}
                />
            }
            <div className={styles.roomsContainer}>
                <p className={styles.roomyLabel}>{de.displayLabels.rooms}:</p>
                <div className={styles.roomsList}>
                    {rooms.map((room, index) => {
                        return (
                            <div className={styles.roomFieldContainer} key={index}>
                                <div
                                    key={index}
                                    className={styles.roomItemContainer}
                                    style={{
                                        background: room.name === currentSelectedRoom?.name ?
                                            "var(--color-secondary)" :
                                            "none"
                                    }}
                                >
                                    <input
                                        value={room.name}
                                        onChange={(event) => {
                                            const updateRooms = [...rooms]
                                            updateRooms[index] = {name: event.target.value, fields: room.fields}
                                            setRooms(updateRooms)
                                        }}
                                        onClick={() => {
                                            handleRoomChange(room)
                                        }}
                                        className={styles.roomInput}

                                    />
                                    <FontAwesomeIcon
                                        onClick={() => {
                                            onRemoveRoomClickHandler(room)
                                        }}
                                        className={styles.deleteButton}
                                        style={{background: "red"} as CSSProperties}
                                        icon={faMinus}/>
                                </div>
                                {Object.entries(room.fields).map(([key], indexFields) =>
                                    (
                                        <div
                                            key={index + indexFields}
                                            className={styles.roomItemContainer}
                                            style={{
                                                background: room.name === currentSelectedRoom?.name ?
                                                    "var(--color-secondary)" :
                                                    "none"
                                            }}
                                        >
                                            <input
                                                value={key}
                                                onChange={(event) => {
                                                    const updateRooms = [...rooms]
                                                    const fields = updateRooms[index].fields
                                                    const fieldValue = fields[key]
                                                    delete fields[key]
                                                    fields[`${event.target.value}`] = fieldValue
                                                    updateRooms[index] = {name: room.name, fields: fields}
                                                    setRooms(updateRooms)
                                                }}
                                                key={"_" + indexFields}
                                                className={styles.roomField}
                                            />
                                            <FontAwesomeIcon
                                                onClick={() => {
                                                    onRemoveFieldClickHandler(room, key)
                                                }}
                                                className={styles.deleteButton}
                                                style={{background: "red"} as CSSProperties}
                                                icon={faMinus}/>
                                        </div>
                                    ))}
                            </div>
                        )
                    })}
                </div>
                <div className={styles.inputSaveContainer}>
                    <input value={roomNameInput}
                           className={`${styles.input} ${
                               roomNameInput.length !== 0 &&
                               rooms.filter(room => room.name === roomNameInput).length === 0 ?
                                   styles.inputValid : styles.inputInvalid
                           } ${rooms.length !== 0 ? styles.inputRooms : ""}`}
                           type={"text"}
                           onChange={(e) => {
                               setRoomNameInput(e.target.value)
                           }}
                           placeholder={de.inputLabels.roomName}
                    />
                    <div onClick={(event) => {
                        if (roomNameInput && roomNameInput.length > 0)
                            onAddRoomClickHandler(event)
                    }}>
                        <FontAwesomeIcon
                            style={{'--color-text': roomNameInput && roomNameInput.length > 0 ? "black" : "grey"} as CSSProperties}
                            icon={faSave}/>
                    </div>
                </div>
                <div className={styles.inputSaveContainer}>
                    <input value={fieldNameInput}
                           className={`${styles.input} ${
                               fieldNameInput.length > 0 ?
                                   styles.inputValid : styles.inputInvalid}`}
                           type={"text"}
                           onChange={(e) => {
                               setFieldNameInput(e.target.value)
                           }}
                           disabled={!currentSelectedRoom || !currentSelectedRoom.name}
                           placeholder={`${de.inputLabels.fieldName} ${
                               !currentSelectedRoom?.name ?
                                   '' :
                                   `${de.displayLabels.for} ${currentSelectedRoom?.name}`}`}
                    />
                    <div onClick={(event) => {
                        if (fieldNameInput && fieldNameInput.length > 0)
                            onAddFieldClickHandler(event)
                    }}>
                        <FontAwesomeIcon
                            style={{'--color-text': fieldNameInput && fieldNameInput.length > 0 ? "black" : "grey"} as CSSProperties}
                            icon={faSave}/>
                    </div>
                </div>
            </div>
            <button onClick={onAddDataClickHandler}
                    disabled={rooms.length === 0}
                    className={styles.button}>{de.buttonLabels.save}
            </button>
        </Modal>
    );
}
export type AddFloorModalProps = {
    changingFloorData?: ChangingFloor
}
