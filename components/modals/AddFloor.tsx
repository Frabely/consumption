import React, {useState} from 'react';
import {RootState} from "@/store/store";
import {useDispatch, useSelector} from "react-redux";
import Modal from "@/components/layout/Modal";
import styles from "@/styles/modals/AddFloor.module.css";
import de from "@/constants/de.json";
import {closeIsAddingFloorDataModalActive} from "@/store/reducer/isAddingFloorDataModalActive";
import {Flat, NumberDictionary, Room} from "@/constants/types";
import {createFlat} from "@/firebase/functions";

export default function AddFloor({}: AddFloorModalProps) {
    const state: RootState = useSelector((state: RootState) => state)
    const dispatch = useDispatch()
    const [flatName, setFlatName] = useState("")
    const [roomNameInput, setRoomNameInput] = useState("")
    const [rooms, setRooms] = useState(new Array<Room>())
    const [fields, setFields] = useState<NumberDictionary>({})
    const [fieldNameInput, setFieldNameInput] = useState("")

    const onAddDataClickHandler = (event: any) => {
        event.preventDefault()
        const flat: Flat = {
            name: flatName,
            rooms: rooms
        }
        createFlat(flat, state.currentHouse.name).then(() => {
            dispatch(closeIsAddingFloorDataModalActive())
        }).catch(error => {
            console.log(error)
        })
    }

    const onAddRoomClickHandler = (event: any) => {
        event.preventDefault()
        const newRoom: Room = {
            name: roomNameInput,
            fields: fields
        }
        setRooms([...rooms, newRoom])
        setFields({})
        setRoomNameInput("")
    }

    const onAddFieldClickHandler = (event: any) => {
        event.preventDefault()
        setFields((prefFields) => ({...prefFields, [`${fieldNameInput}`]: null}))
        setFieldNameInput("")
    }

    const onAbortClickHandler = () => {
        dispatch(closeIsAddingFloorDataModalActive())
    }

    return (
        <Modal formName={'addFloor'}>
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
                <div className={styles.roomsList}>
                    {rooms.map((room, index) => {
                        return (
                            <div key={index}>
                                <p key={index}>{room.name}</p>
                                {Object.entries(room.fields).map(([key], indexFields) =>
                                    (<p className={styles.roomField} key={"z"+indexFields}>{key}</p>))}
                            </div>
                        )
                    })}
                </div>
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
                <div className={styles.fieldsContainer}>
                    <p className={styles.fieldsLabel}>{de.displayLabels.fields}:</p>
                    <div className={styles.roomsList}>
                        {Object.entries(fields).map(([key], index) => {
                            return (
                                <p key={index}>{key}</p>
                            )
                        })}
                    </div>
                    <input value={fieldNameInput}
                           className={`${styles.input} ${
                               fieldNameInput.length !== 0 &&
                               Object.entries(fields)
                                   .filter(([key]) => key === fieldNameInput).length === 0 ?
                                   styles.inputValid : styles.inputInvalid}`}
                           type={"text"}
                           onChange={(e) => {
                               setFieldNameInput(e.target.value)
                           }}
                           placeholder={de.inputLabels.fieldName}
                    />
                    <button
                        onClick={onAddFieldClickHandler}
                        disabled={fieldNameInput.length === 0 ||
                            Object.entries(fields).
                                filter(([key]) => key === fieldNameInput).length > 0}
                        className={styles.button}>{de.buttonLabels.add}
                    </button>
                </div>
                <button
                    onClick={onAddRoomClickHandler}
                    disabled={
                    roomNameInput.length === 0 ||
                        rooms.filter(room => room.name === roomNameInput).length > 0}
                    className={styles.button}>{de.buttonLabels.add}
                </button>
            </div>
            <button onClick={onAddDataClickHandler} disabled={rooms.length === 0} className={styles.button}>{de.buttonLabels.add}</button>
            <button onClick={onAbortClickHandler} className={styles.button}>{de.buttonLabels.abort}</button>
        </Modal>
    );
}
export type AddFloorModalProps = {
}
