'use client'

import styles from "../../styles/layout/Modal.module.css"

export default function Modal(props: any, {formName}: ModalProps) {

    return (
        <div className={styles.mainContainer}>
            <form name={formName} className={styles.mainInnerContainer}>
                {props.children}
            </form>
        </div>
    );
}

export type ModalProps = {
    formName: string
}
