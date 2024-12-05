'use client'

import styles from "../../styles/layout/Modal.module.css"
import {RootState} from "@/store/store";
import {useDispatch, useSelector} from "react-redux";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClose} from "@fortawesome/free-solid-svg-icons";
import {setModalStateNone} from "@/store/reducer/modalState";

export default function Modal(props: any, {formName}: ModalProps) {
    const state: RootState = useSelector((state: RootState) => state)
    const dispatch = useDispatch()

    const onCloseClickHandler = async () => {
        dispatch(setModalStateNone())
    }

    return (
        <div className={styles.mainContainer} style={state.dimension.isHorizontal ? {marginTop: '0'} : {}}>
            <form name={formName} className={styles.mainInnerContainer}>
                <div className={styles.header}>
                    <FontAwesomeIcon
                        className={styles.icon}
                        onClick={() => onCloseClickHandler()}
                        icon={faClose}/>
                </div>
                <div className={styles.childPropsContainer}>
                    {props.children}
                </div>
            </form>
        </div>
    );
}

export type ModalProps = {
    formName: string
}
