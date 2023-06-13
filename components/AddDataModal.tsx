'use client'

import styles from "../styles/AddDataModal.module.css"
import de from '../constants/de.json'
import {useState} from "react";

export default function AddDataModal({}: AddDataModalProps) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();

    const hours = today.getHours();
    const minutes = today.getMinutes();

    const [dateValue, setDateValue] = useState(
        `${year}-${month < 10 ? `0` + month : month}-${date < 10 ? `0` + date : date}`
    );

    const [timeValue, setTimeValue] = useState(
        `${hours < 10 ? `0` + hours : hours}:${minutes < 10 ? `0` + minutes : minutes}`
    );

    return (
        <div className={styles.mainContainer}>
            <form className={styles.mainInnerContainer}>
                <input onChange={(e) => {
                    setDateValue(e.target.value)
                }} value={dateValue} type={"date"}/>
                <input onChange={(e) => {
                    setTimeValue(e.target.value)
                }} value={timeValue} type={"time"}/>
                <input type={"number"} min={"99999"} max={"999999"} step={"1.0"}
                       placeholder={de.inputLabels.kilometer}/>
                <input type={"number"} min={"0.1"} max={"99.9"} step={"0.1"} placeholder={de.inputLabels.power}/>
                <input disabled={true} type={"text"} min={"0.1"} max={"99.9"} step={"0.1"}
                       placeholder={de.inputLabels.name}/>
                <button className={styles.button}>{de.buttonLabels.addDate}</button>
                <button className={styles.button}>{de.buttonLabels.abort}</button>
            </form>
        </div>
    );
}

export type AddDataModalProps = {}
