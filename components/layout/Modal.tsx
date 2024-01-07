'use client'

import styles from "../../styles/layout/Modal.module.css"
import {RootState} from "@/store/store";
import {useSelector} from "react-redux";

export default function Modal(props: any, {formName}: ModalProps) {
    const state: RootState = useSelector((state: RootState) => state)

    return (
        <div className={styles.mainContainer} style={state.dimension.isHorizontal ? {marginTop: '0'} : {}}>
            <form name={formName} className={styles.mainInnerContainer}>
                {props.children}
            </form>
        </div>
    );
}

export type ModalProps = {
    formName: string
}
