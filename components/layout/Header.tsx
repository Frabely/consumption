'use client'

import styles from '../../styles/layout/Header.module.css'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPowerOff, faAdd} from '@fortawesome/free-solid-svg-icons'
import {useDispatch} from "react-redux";
import {closeIsAddingDataModalActive, invertIsAddingDataModalActive} from "@/store/reducer/isAddingDataModalActive";
import {setIsChangingData} from "@/store/reducer/isChangingData";
import {setCurrentUser} from "@/store/reducer/currentUser";
import {EMPTY_USER} from "@/constants/constantData";

export default function Header({}: HeaderProps) {
    const dispatch = useDispatch()

    const onAddDataClickHandler = () => {
        dispatch(setIsChangingData(false))
        dispatch(invertIsAddingDataModalActive())
    }

    const onLogoutHandler = () => {
        dispatch(setCurrentUser(EMPTY_USER))
        dispatch(closeIsAddingDataModalActive())
    }

    return (
        <div className={styles.mainContainer}>
            <menu className={styles.menu}>
                {/*<button onClick={onAddDataClickHandler} className={styles.menuItem}>{de.menu.addData}</button>*/}
                <div onClick={onAddDataClickHandler} className={styles.menuItem}>
                    <FontAwesomeIcon icon={faAdd}/>
                </div>
                <div onClick={onLogoutHandler} className={styles.menuItem}>
                    <FontAwesomeIcon icon={faPowerOff}/>
                </div>

            </menu>
        </div>
    )
}

export type HeaderProps = {}
