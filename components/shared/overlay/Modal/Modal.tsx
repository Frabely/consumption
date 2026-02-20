'use client'

import styles from "./Modal.module.css"
import {useAppDispatch} from "@/store/hooks";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClose} from "@fortawesome/free-solid-svg-icons";
import {setModalStateNone} from "@/store/reducer/modalState";
import {ReactNode} from "react";

export default function Modal({
    formName,
    children,
    title,
    contentTransparent = false,
    contentAutoHeight = false
}: ModalProps) {
    const dispatch = useAppDispatch()

    const onCloseClickHandler = async () => {
        dispatch(setModalStateNone())
    }

    return (
        <div className={styles.mainContainer}>
            <form
                name={formName}
                className={styles.mainInnerContainer}
            >
                <div className={styles.header}>
                    {title ? <h2 className={styles.headerTitle}>{title}</h2> : null}
                    <FontAwesomeIcon
                        className={styles.icon}
                        onClick={() => onCloseClickHandler()}
                        icon={faClose}/>
                </div>
                <div className={`${styles.childPropsContainer} ${contentTransparent ? styles.childPropsContainerTransparent : ""} ${contentAutoHeight ? styles.childPropsContainerAutoHeight : ""}`}>
                    {children}
                </div>
            </form>
        </div>
    );
}

export type ModalProps = {
    formName: string;
    children: ReactNode;
    title?: string;
    contentTransparent?: boolean;
    contentAutoHeight?: boolean;
}
