import React, {CSSProperties, useState} from 'react';
import {RootState} from "@/store/store";
import {useDispatch, useSelector} from "react-redux";
import Modal from "@/components/layout/Modal";
import styles from "@/styles/modals/AddFloor.module.css";
import de from "@/constants/de.json";
import {Field, Flat, Room} from "@/constants/types";
import {createFlat, updateFlat} from "@/firebase/functions";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAdd, faMinus} from "@fortawesome/free-solid-svg-icons";
import {setModalStateNone} from "@/store/reducer/modalState";
import {ModalState} from "@/constants/enums";
import {setIsLoading} from "@/store/reducer/isLoading";
import {setIsReloadHousesNeeded} from "@/store/reducer/isReloadDataNeeded";
import CustomButton from "@/components/layout/CustomButton";

export default function AddFloor({currentFlat: currentFlat, newFlatPosition}: AddFloorModalProps) {
    const state: RootState = useSelector((state: RootState) => state)
    const dispatch = useDispatch()
    const [flatName, setFlatName] = useState(currentFlat && currentFlat?.rooms ? currentFlat.name : "")
    const [roomNameInput, setRoomNameInput] = useState("")
    const [rooms, setRooms] = useState<Room[]>(currentFlat && currentFlat?.rooms ? currentFlat.rooms : [])
    const [fieldNameInput, setFieldNameInput] = useState("")
    const [currentSelectedRoom, setCurrentSelectedRoom] = useState<Room | undefined>(currentFlat?.rooms[0])

    const onAddDataClickHandler = async (event: any) => {
        dispatch(setIsLoading(true))
        event.preventDefault()

        try {
            if (state.modalState === ModalState.ChangeFloorFields && currentFlat) {
                const newFlat: Flat = {id: currentFlat.id, name: flatName, rooms: rooms, position: currentFlat.position}
                await updateFlat(state.currentHouse.name, newFlat)
            } else {
                const newFlat: Flat = {id: "", name: flatName, rooms: rooms, position: newFlatPosition}
                await createFlat(newFlat, state.currentHouse.name)
            }
            dispatch(setModalStateNone())
            dispatch(setIsReloadHousesNeeded(true))
            dispatch(setIsLoading(false))
        } catch (error) {
            console.log(error)
            alert(de.messages.databaseError)
            dispatch(setIsLoading(false))
        }
    }

    const onAddRoomClickHandler = (event: any) => {
        event.preventDefault()
        if (roomNameInput.length === 0) {
            alert(de.messages.fieldNameEmpty)
            return
        }
        const newRooms = [...rooms]
        const newRoom: Room = {
            id: "",
            name: roomNameInput,
            fields: [],
            position: newRooms.length
        }
        newRooms.push(newRoom)
        setRooms(newRooms)
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

        const newFields = [...currentSelectedRoom.fields]
        const newField: Field = {
            id: "",
            name: fieldNameInput,
            position: newFields.length}
        newFields.push(newField)
        const newRoom: Room = {
            id: currentSelectedRoom.id,
            name: currentSelectedRoom.name,
            fields: newFields,
            position: currentSelectedRoom.position
        }
        const newRooms = rooms.map((currentRoom) => {
            if (currentRoom.name !== currentSelectedRoom.name) {
                return currentRoom
            }
            return newRoom
        })
        setCurrentSelectedRoom(newRoom)
        setRooms(newRooms)
        setFieldNameInput("")
    }

    const onRoomNameChange = (event: any, indexCurrentRoom: number) => {
        const newRooms = [...rooms]
        newRooms[indexCurrentRoom] = {id: rooms[indexCurrentRoom].id, name: event.target.value, fields: rooms[indexCurrentRoom].fields}
        setRooms(newRooms)
        setCurrentSelectedRoom(newRooms[indexCurrentRoom])
    }

    const onFieldNameChange = (event: any, indexCurrentRoom: number, indexCurrentField: number) => {
        const newRooms = [...rooms]
        const newFields = [...newRooms[indexCurrentRoom].fields]
        newFields[indexCurrentField] = {
            id: newFields[indexCurrentField].id,
            name: event.target.value,
        }
        newRooms[indexCurrentRoom] = {
            id: rooms[indexCurrentRoom].id,
            name: rooms[indexCurrentRoom].name,
            fields: newFields
        }
        setRooms(newRooms)
    }

    const onRemoveRoomClickHandler = (room: Room) => {
        if (window.confirm(de.messages.deleteRoomConfirmation.replace("{0}", room.name))) {
            setRooms(rooms.filter((currentRoom) => currentRoom.name !== room.name)
                .map((room, index) => {
                    return {
                        id: room.id, name:
                        room.name,
                        fields: room.fields,
                        position: index
                    }
                }))
            if(currentSelectedRoom && room.name === currentSelectedRoom.name)
                setCurrentSelectedRoom(undefined)
        }
    }

    const onRemoveFieldClickHandler = (room: Room, currentField: Field) => {
        if (window.confirm(de.messages.deleteFieldConfirmation.replace("{0}", currentField.name))) {
            let newFields = [...room.fields]
            newFields = newFields.filter((field) => field.name !== currentField.name)
                .map((field, index) => {
                return {
                    id: field.id,
                    name: field.name,
                    position: index
                }
            })
            const newRooms = rooms.map((currentRoom) => {
                if (currentRoom.name !== room.name) {
                    return currentRoom
                }
                return {id: room.id, name: room.name, fields: newFields, position: room.position}
            })
            setRooms(newRooms)
        }
    }

    return (
        <>

            <Modal
                formName={currentFlat ? `${ModalState.AddFloor}` : `${ModalState.ChangeFloorFields}`}
            >
                <div className={styles.mainContainer}>
                    <input value={flatName}
                           className={`${styles.input} ${flatName.length !== 0 ? styles.inputValid : styles.inputInvalid}`}
                           type={"text"}
                           onChange={(e) => {
                               setFlatName(e.target.value)
                           }}
                           placeholder={de.inputLabels.flatName}
                    />
                    <div className={styles.roomsContainer}>
                        <p className={styles.roomyLabel}>{de.displayLabels.rooms}:</p>
                        <div
                            className={styles.roomsList}
                        >
                            {rooms.map((room, index) => {
                                return (
                                    <div className={styles.roomFieldContainer} key={index}>
                                        <div
                                            key={index}
                                            className={styles.roomItemContainer}
                                            style={{
                                                background: room.name === currentSelectedRoom?.name ?
                                                    "var(--tertiary-color)" :
                                                    "var(--secondary-color)"
                                            }}
                                        >
                                            <input
                                                value={room.name}
                                                onChange={(event) => {
                                                    onRoomNameChange(event, index)
                                                }}
                                                onClick={() => {
                                                    setCurrentSelectedRoom(room)
                                                }}
                                                className={styles.roomInput}

                                            />
                                            <FontAwesomeIcon
                                                onClick={() => {
                                                    onRemoveRoomClickHandler(room)
                                                }}
                                                className={styles.deleteButton}
                                                icon={faMinus}/>
                                        </div>
                                        {room.fields.map((field, indexFields) =>
                                            (
                                                <div
                                                    key={index + indexFields}
                                                    className={styles.roomItemContainer}
                                                    style={{
                                                        background: room.name === currentSelectedRoom?.name ?
                                                            "var(--tertiary-color)" :
                                                            "var(--secondary-color)",
                                                        marginLeft: '1rem'

                                                    }}
                                                    onClick={() => {
                                                        setCurrentSelectedRoom(room)
                                                    }}
                                                >
                                                    <input
                                                        value={field.name}
                                                        onChange={(event) => {
                                                            onFieldNameChange(event, index, indexFields)
                                                        }}
                                                        key={"_" + indexFields}
                                                        className={styles.roomField}
                                                    />
                                                    <FontAwesomeIcon
                                                        onClick={() => {
                                                            onRemoveFieldClickHandler(room, field)
                                                        }}
                                                        className={styles.deleteButton}
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
                                if (roomNameInput &&
                                    roomNameInput.length > 0 &&
                                    rooms.filter(room => room.name === roomNameInput).length === 0
                                )
                                    onAddRoomClickHandler(event)
                            }}>
                                <FontAwesomeIcon
                                    style={
                                        {
                                            '--text-color':
                                                roomNameInput &&
                                                roomNameInput.length > 0 &&
                                                rooms.filter(room => room.name === roomNameInput).length === 0 ?
                                                    "var(--text-color)" :
                                                    "var(--text-color-muted)"
                                        } as CSSProperties
                                    }
                                    icon={faAdd}/>
                            </div>
                        </div>
                        <div className={styles.inputSaveContainer}>
                            <input value={fieldNameInput}
                                   className={`${styles.input} ${
                                       fieldNameInput.length > 0 &&
                                       currentSelectedRoom?.fields
                                           .filter(field => field.name === fieldNameInput).length === 0 ?
                                           styles.inputValid : styles.inputInvalid}`}
                                   type={"text"}
                                   onChange={(e) => {
                                       setFieldNameInput(e.target.value)
                                   }}
                                   disabled={!currentSelectedRoom || !currentSelectedRoom.name}
                                   placeholder={`${de.inputLabels.fieldName} ${
                                       !currentSelectedRoom?.name ?
                                           '' :
                                           `${currentSelectedRoom?.name}`}`}
                            />
                            <div onClick={(event) => {
                                if (
                                    fieldNameInput &&
                                    fieldNameInput.length > 0 &&
                                    currentSelectedRoom?.fields
                                        .filter(field => field.name === fieldNameInput).length === 0
                                )
                                    onAddFieldClickHandler(event)
                            }}>
                                <FontAwesomeIcon
                                    style={
                                        {
                                            '--text-color': fieldNameInput &&
                                            fieldNameInput.length > 0 &&
                                            currentSelectedRoom?.fields
                                                .filter(field => field.name === fieldNameInput).length === 0 ?
                                                "var(--text-color)" :
                                                "var(--text-color-muted)"
                                        } as CSSProperties
                                    }
                                    icon={faAdd}/>
                            </div>
                        </div>
                    </div>
                    <CustomButton
                        onClick={
                            async (event) => {
                                await onAddDataClickHandler(event)
                            }}
                        disabled={rooms.length === 0}
                        label={de.buttonLabels.save}/>
                </div>

            </Modal>
        </>
    );
}
export type AddFloorModalProps = {
    currentFlat?: Flat,
    newFlatPosition?: number,
}
