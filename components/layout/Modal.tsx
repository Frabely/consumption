'use client'

import styles from "../../styles/layout/Modal.module.css"
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
    containerTransparent = false,
    closeInsideContent = false,
    closeInsideFlow = false,
    closeIconTop,
    contentAutoHeight = false,
    hideCloseIcon = false,
    disableContentScroll = false
}: ModalProps) {
    const dispatch = useAppDispatch()

    const onCloseClickHandler = async () => {
        dispatch(setModalStateNone())
    }

    return (
        <div className={styles.mainContainer}>
            <form
                name={formName}
                className={`${styles.mainInnerContainer} ${containerTransparent ? styles.mainInnerContainerTransparent : ""}`}
            >
                {closeInsideContent || hideCloseIcon ? null : (
                    <div className={styles.header}>
                        {title ? <h2 className={styles.headerTitle}>{title}</h2> : null}
                        <FontAwesomeIcon
                            className={styles.icon}
                            onClick={() => onCloseClickHandler()}
                            icon={faClose}/>
                    </div>
                )}
                <div className={`${styles.childPropsContainer} ${contentTransparent ? styles.childPropsContainerTransparent : ""} ${closeInsideContent && !closeInsideFlow ? styles.childPropsContainerWithInnerClose : ""} ${contentAutoHeight ? styles.childPropsContainerAutoHeight : ""} ${disableContentScroll ? styles.childPropsContainerNoScroll : ""}`}>
                    {closeInsideContent && !hideCloseIcon ? (
                        closeInsideFlow ? (
                            <div className={styles.innerCloseRow}>
                                <FontAwesomeIcon
                                    className={`${styles.icon} ${styles.iconInFlow}`}
                                    onClick={() => onCloseClickHandler()}
                                    icon={faClose}/>
                            </div>
                        ) : (
                            <FontAwesomeIcon
                                className={`${styles.icon} ${styles.iconInner}`}
                                style={closeIconTop ? {top: closeIconTop} : undefined}
                                onClick={() => onCloseClickHandler()}
                                icon={faClose}/>
                        )
                    ) : null}
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
    containerTransparent?: boolean;
    closeInsideContent?: boolean;
    closeInsideFlow?: boolean;
    closeIconTop?: string;
    contentAutoHeight?: boolean;
    hideCloseIcon?: boolean;
    disableContentScroll?: boolean;
}
