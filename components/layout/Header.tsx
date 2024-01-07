'use client'

import styles from '../../styles/layout/Header.module.css'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPowerOff, faAdd, faFileCsv, faHouseFire} from '@fortawesome/free-solid-svg-icons'
import {useDispatch, useSelector} from "react-redux";
import {closeIsAddingDataModalActive, invertIsAddingDataModalActive} from "@/store/reducer/isAddingDataModalActive";
import {setIsChangingData} from "@/store/reducer/isChangingData";
import {setCurrentUser} from "@/store/reducer/currentUser";
import {cars, EMPTY_USER} from "@/constants/constantData";
import {closeIsDownloadCsvModalActive, invertIsDownloadCsvModalActive} from "@/store/reducer/isDownloadCsvModalActive";
import {RootState} from "@/store/store";
import {ChangeEvent, useEffect} from "react";
import {setCurrentCar} from "@/store/reducer/currentCar";
import {getCars} from "@/firebase/functions";
import Link from "next/link";

export default function Header({}: HeaderProps) {
    const dispatch = useDispatch()
    const state: RootState = useSelector((state: RootState) => state)

    useEffect(() => {
        dispatch(setCurrentCar(cars.filter(car => car.name === 'Zoe')[0]))
    }, [dispatch])

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

    const onCarChangeHandler = (event: ChangeEvent<HTMLSelectElement>) => {
        getCars().then((result) => {
            if (result) {
                dispatch(setCurrentCar(result.filter(car => car.name === event.target.value)[0]))
            }
        }).catch((error: Error) => {
            console.log(error.message)
        })
    }

    return (
        <div className={styles.mainContainer}>
            <menu className={styles.menu}>
                <div className={styles.menuItem}>
                    <select onChange={onCarChangeHandler} defaultValue={state.currentCar.name}
                            className={styles.select}>
                        {cars.map((car) => {
                            return (<option key={car.name}>{car.name}</option>)
                        })}
                    </select>
                </div>
                <div onClick={onAddDataClickHandler} className={styles.menuItem}>
                    <FontAwesomeIcon icon={faAdd}/>
                </div>
                <div onClick={onExportAsCsvClickHandler} className={styles.menuItem}>
                    <FontAwesomeIcon icon={faFileCsv}/>
                </div>
                <Link href={'/buildingConsumption'} className={styles.menuItem}>
                    <FontAwesomeIcon icon={faHouseFire}/>
                </Link>
                <div onClick={onLogoutHandler} className={styles.menuItem}>
                    <FontAwesomeIcon icon={faPowerOff}/>
                </div>

            </menu>
        </div>
    )
}

export type HeaderProps = {}
