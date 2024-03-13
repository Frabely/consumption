'use client'

import de from '../../constants/de.json'
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/store/store";
import Modal from "@/components/layout/Modal";
import {Language} from "@/constants/types";
import styles from "@/styles/modals/AddFloorData.module.css";
import {closeIsAddingFloorDataModalActive} from "@/store/reducer/isAddingFloorDataModalActive";

export default function AddFloorData({}: AddFloorDataModalProps) {
    const language: Language = de
    const state: RootState = useSelector((state: RootState) => state)
    const dispatch = useDispatch()

    const onAbortClickHandler = () => {
        dispatch(closeIsAddingFloorDataModalActive())
    }

    return (
        <Modal formName={'addFloorData'}>
            <button onClick={onAbortClickHandler} className={styles.button}>{de.buttonLabels.abort}</button>
        </Modal>
    );
}

export type AddFloorDataModalProps = {}
