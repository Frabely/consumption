import React, {CSSProperties, useState} from 'react';
import {RootState} from "@/store/store";
import {useDispatch, useSelector} from "react-redux";
import Modal from "@/components/layout/Modal";
import styles from "@/styles/modals/AddFloor.module.css";
import de from "@/constants/de.json";
import {Field, Flat, Room} from "@/constants/types";
import {createFlat, updateFlat} from "@/firebase/functions";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAdd, faMinus, faAnglesUp, faAnglesDown} from "@fortawesome/free-solid-svg-icons";
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
            position: newFields.length
        }
        newFields.push(newField)
        const newRoom: Room = {...currentSelectedRoom, fields: newFields}
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
        newRooms[indexCurrentRoom] = {
            ...rooms[indexCurrentRoom],
            name: event.target.value,
        }
        setRooms(newRooms)
        setCurrentSelectedRoom(newRooms[indexCurrentRoom])
    }

    const onFieldNameChange = (event: any, indexCurrentRoom: number, indexCurrentField: number) => {
        const newRooms = [...rooms]
        const newFields = [...newRooms[indexCurrentRoom].fields]
        newFields[indexCurrentField] = {
            ...newRooms[indexCurrentRoom].fields[indexCurrentField],
            name: event.target.value,
        }
        newRooms[indexCurrentRoom] = {
            ...newRooms[indexCurrentRoom],
            fields: newFields
        }
        setRooms(newRooms)
    }

    const onRoomArrowUpClickHandler = (room: Room, index: number) => {
        let newRooms = [...rooms]
        const oldRoom: Room = newRooms[index - 1]
        newRooms[index - 1] = {...room, position: oldRoom.position}
        newRooms[index] = {...oldRoom, position: room.position}
        setRooms(newRooms)
    }

    const onRoomArrowDownClickHandler = (room: Room, index: number) => {
        let newRooms = [...rooms]
        const oldRoom: Room = newRooms[index + 1]
        newRooms[index + 1] = {...room, position: oldRoom.position}
        newRooms[index] = {...oldRoom, position: room.position}
        setRooms(newRooms)
    }

    const onFieldArrowUpClickHandler = (currentRoom: Room, currentField: Field, index: number) => {
        let newRooms: Room[] = [...rooms]
        const indexCurrentRoom = newRooms.indexOf(currentRoom)
        let newFields = [...newRooms[indexCurrentRoom].fields]
        const oldField: Field = newFields[index - 1]
        newFields[index - 1] = {...currentField, position: oldField.position}
        newFields[index] = {...oldField, position: currentField.position}
        newRooms[indexCurrentRoom] = {
            ...newRooms[indexCurrentRoom],
            fields: newFields,
        }
        setRooms(newRooms)
    }

    const onFieldArrowDownClickHandler = (currentRoom: Room, currentField: Field, index: number) => {
        let newRooms: Room[] = [...rooms]
        const indexCurrentRoom = newRooms.indexOf(currentRoom)
        let newFields = [...newRooms[indexCurrentRoom].fields]
        const oldField: Field = newFields[index + 1]
        newFields[index + 1] = {...currentField, position: oldField.position}
        newFields[index] = {...oldField, position: currentField.position}
        newRooms[indexCurrentRoom] = {
            ...newRooms[indexCurrentRoom],
            fields: newFields,
        }
        setRooms(newRooms)
    }

    const onRemoveRoomClickHandler = (room: Room) => {
        if (window.confirm(de.messages.deleteRoomConfirmation.replace("{0}", room.name))) {
            setRooms(rooms.filter((currentRoom) => currentRoom.name !== room.name)
                .map((room, index) => {
                    return {...room, position: index}
                }))
            if (currentSelectedRoom && room.name === currentSelectedRoom.name)
                setCurrentSelectedRoom(undefined)
        }
    }

    const onRemoveFieldClickHandler = (room: Room, currentField: Field) => {
        if (window.confirm(de.messages.deleteFieldConfirmation.replace("{0}", currentField.name))) {
            let newFields = [...room.fields]
            newFields = newFields.filter((field) => field.name !== currentField.name)
                .map((field, index) => {
                    return {...field, position: index}
                })
            const newRooms = rooms.map((currentRoom) => {
                if (currentRoom.name !== room.name) {
                    return currentRoom
                }
                return {...room, fields: newFields}
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
                                            {index === 0 ? null :
                                                <FontAwesomeIcon
                                                    onClick={() => {
                                                        onRoomArrowUpClickHandler(room, index)
                                                    }}
                                                    className={styles.arrowButton}
                                                    icon={faAnglesUp}/>
                                            }
                                            {index >= rooms.length - 1 ? null :
                                                <FontAwesomeIcon
                                                    onClick={() => {
                                                        onRoomArrowDownClickHandler(room, index)
                                                    }}
                                                    className={styles.arrowButton}
                                                    icon={faAnglesDown}/>
                                            }
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
                                                    {indexFields === 0 ? null :
                                                        <FontAwesomeIcon
                                                            onClick={() => {
                                                                onFieldArrowUpClickHandler(room, field, indexFields)
                                                            }}
                                                            className={styles.arrowButton}
                                                            icon={faAnglesUp}/>
                                                    }
                                                    {indexFields >= room.fields.length - 1 ? null :
                                                        <FontAwesomeIcon
                                                            onClick={() => {
                                                                onFieldArrowDownClickHandler(room, field, indexFields)
                                                            }}
                                                            className={styles.arrowButton}
                                                            icon={faAnglesDown}/>
                                                    }
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
