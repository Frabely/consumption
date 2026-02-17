'use client'

import styles from "../../styles/layout/Modal.module.css"
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClose} from "@fortawesome/free-solid-svg-icons";
import {setModalStateNone} from "@/store/reducer/modalState";
import {ReactNode} from "react";

export default function Modal({formName, children}: ModalProps) {
    const isHorizontal: boolean = useAppSelector((state) => state.dimension.isHorizontal)
    const dispatch = useAppDispatch()

    const onCloseClickHandler = async () => {
        dispatch(setModalStateNone())
    }

    return (
        <div className={styles.mainContainer} style={isHorizontal ? {marginTop: '0'} : {}}>
            <form name={formName} className={styles.mainInnerContainer}>
                <div className={styles.header}>
                    <FontAwesomeIcon
                        className={styles.icon}
                        onClick={() => onCloseClickHandler()}
                        icon={faClose}/>
                </div>
                <div className={styles.childPropsContainer}>
                    {children}
                </div>
            </form>
        </div>
    );
}

export type ModalProps = {
    formName: string;
    children: ReactNode;
}
