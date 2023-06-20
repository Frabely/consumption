'use client'

import styles from '../../styles/layout/Header.module.css'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faGear} from '@fortawesome/free-solid-svg-icons'
import de from '../../constants/de.json'
import {useDispatch} from "react-redux";
import {invertIsAddingDataModalActive} from "@/store/reducer/isAddingDataModalActive";
import {RootState} from "@/store/store";

export default function Header({}: HeaderProps) {
    const dispatch = useDispatch()

    const onAddDataClickHandler = () => {
        dispatch(invertIsAddingDataModalActive())
    }

    return (
        <div className={styles.mainContainer}>

            <menu className={styles.menu}>
                <div className={styles.menuRight}>
                    <button onClick={onAddDataClickHandler} className={styles.menuItem}>{de.menu.addData}</button>
                    <div className={styles.menuItem}>
                        <FontAwesomeIcon icon={faGear}/>
                    </div>
                </div>

            </menu>
        </div>
    )
}

export type HeaderProps = {}
