'use client'

import de from '../../constants/de.json'
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/store/store";
import Modal from "@/components/layout/Modal";
import {Language} from "@/constants/types";
import styles from "@/styles/modals/AddFloorData.module.css";
import {closeIsAddingFloorDataModalActive} from "@/store/reducer/isAddingFloorDataModalActive";
import {ChangeEvent, useState} from "react";

export default function AddFloorData({}: AddFloorDataModalProps) {
    const language: Language = de
    const state: RootState = useSelector((state: RootState) => state)
    const dispatch = useDispatch()

    const [counterNumber, setCounterNumber] = useState('')
    const [kilowattValue, setKilowattValue] = useState('')

    const onCounterNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
        const currentCounterNumber: number | undefined = parseInt(event.target.value)
        if (currentCounterNumber && currentCounterNumber > 0)
            setCounterNumber(currentCounterNumber.toString())
        else
            setCounterNumber('')
    }

    const onKilowattValueChange = (event: ChangeEvent<HTMLInputElement>) => {
        const currentKilowattValue: number | undefined = parseInt(event.target.value)
        if (currentKilowattValue && currentKilowattValue > 0)
            setKilowattValue(currentKilowattValue.toString())
        else
            setKilowattValue('')
    }

    const onAbortClickHandler = () => {
        dispatch(closeIsAddingFloorDataModalActive())
    }

    return (
        <Modal formName={'addFloorData'}>
            <input value={counterNumber}
                   className={`${styles.input} ${true ? styles.inputValid : styles.inputInvalid}`}
                   type={"number"}
                   min={0}
                   max={999999}
                   step={1.0}
                   onChange={(e) => {
                       onCounterNumberChange(e)
                   }}
                   placeholder={de.inputLabels.kilometer}
            />
            <input value={kilowattValue}
                   className={`${styles.input} ${true ? styles.inputValid : styles.inputInvalid}`}
                   type={"number"}
                   min={0}
                   max={999999}
                   step={1.0}
                   onChange={(e) => {
                       onKilowattValueChange(e)
                   }}
                   placeholder={de.inputLabels.kilometer}
            />
            <button onClick={onAbortClickHandler} className={styles.button}>{de.buttonLabels.abort}</button>
        </Modal>
    );
}

export type AddFloorDataModalProps = {}
