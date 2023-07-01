'use client'

import styles from '../../styles/layout/Header.module.css'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPowerOff, faAdd, faFileCsv} from '@fortawesome/free-solid-svg-icons'
import {useDispatch} from "react-redux";
import {closeIsAddingDataModalActive, invertIsAddingDataModalActive} from "@/store/reducer/isAddingDataModalActive";
import {setIsChangingData} from "@/store/reducer/isChangingData";
import {setCurrentUser} from "@/store/reducer/currentUser";
import {EMPTY_USER} from "@/constants/constantData";
import {closeIsDownloadCsvModalActive, invertIsDownloadCsvModalActive} from "@/store/reducer/isDownloadCsvModalActive";

export default function Header({}: HeaderProps) {
    const dispatch = useDispatch()

    const onAddDataClickHandler = () => {
        dispatch(closeIsDownloadCsvModalActive())
        dispatch(setIsChangingData(false))
        dispatch(invertIsAddingDataModalActive())
    }

    const onLogoutHandler = () => {
        dispatch(setCurrentUser(EMPTY_USER))
        dispatch(closeIsAddingDataModalActive())
        dispatch(closeIsDownloadCsvModalActive())
    }


    const onExportAsCsvClickHandler = () => {
        dispatch(closeIsAddingDataModalActive())
        dispatch(invertIsDownloadCsvModalActive())
    }

    return (
        <div className={styles.mainContainer}>
            <menu className={styles.menu}>
                <div onClick={onAddDataClickHandler} className={styles.menuItem}>
                    <FontAwesomeIcon icon={faAdd}/>
                </div>
                {/*<div onClick={onExportAsCsvClickHandler} className={styles.menuItem}>*/}
                {/*    <select>*/}
                {/*        <option>Zoe</option>*/}
                {/*    </select>*/}
                {/*</div>*/}
                <div onClick={onExportAsCsvClickHandler} className={styles.menuItem}>
                    <FontAwesomeIcon icon={faFileCsv}/>
                </div>
                <div onClick={onLogoutHandler} className={styles.menuItem}>
                    <FontAwesomeIcon icon={faPowerOff}/>
                </div>

            </menu>
        </div>
    )
}

export type HeaderProps = {}
