'use client'

import styles from '../../styles/layout/Menu.module.css'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faAdd, faEllipsis, faFileCsv, faHouseFire, faPowerOff, faXmark} from '@fortawesome/free-solid-svg-icons'
import {useDispatch, useSelector} from "react-redux";
import {setModalStateNone, setModalState} from "@/store/reducer/modalState";
import {setIsChangingData} from "@/store/reducer/isChangingData";
import {setCurrentUser} from "@/store/reducer/currentUser";
import {cars, EMPTY_USER, houses, PATH_STRINGS} from "@/constants/constantData";
import {RootState} from "@/store/store";
import {ChangeEvent, useState} from "react";
import {setCurrentCar} from "@/store/reducer/currentCar";
import {getCars} from "@/firebase/functions";
import Link from "next/link";
import {setCurrentHouse} from "@/store/reducer/currentHouse";
import CustomSelect from "@/components/layout/CustomSelect";
import {ModalState} from "@/constants/enums";

export default function Menu({}: HeaderProps) {
    const dispatch = useDispatch()
    const state: RootState = useSelector((state: RootState) => state)

    const [menuOpen, setMenuOpen] = useState(false)

    const onAddDataClickHandler = () => {
        dispatch(setModalStateNone())
        dispatch(setIsChangingData(false))
        dispatch(setModalState(ModalState.AddCarData))
    }

    const onLogoutHandler = () => {
        dispatch(setCurrentUser(EMPTY_USER))
        dispatch(setModalStateNone())
    }


    const onExportAsCsvClickHandler = () => {
        dispatch(setModalStateNone())
        dispatch(setModalState(ModalState.DownloadCsv))
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

    const onHouseChangeHandler = (event: ChangeEvent<HTMLSelectElement>) => {
        dispatch(setCurrentHouse(houses.filter(house => house.name === event.target.value)[0]))
    }

    return (
        <>
            {state.dimension.isHorizontal ?
                <div className={styles.mainContainerHor}>
                    <button className={styles.button} onClick={() => setMenuOpen(!menuOpen)}>
                        <FontAwesomeIcon icon={menuOpen ? faXmark : faEllipsis}/>
                    </button>
                    {menuOpen ? (
                        <>
                            <button onClick={onLogoutHandler} className={styles.button}>
                                <FontAwesomeIcon icon={faPowerOff}/>
                            </button>
                            <button onClick={onExportAsCsvClickHandler} className={styles.button}>
                                <FontAwesomeIcon icon={faFileCsv}/>
                            </button>
                            <select onChange={onCarChangeHandler} defaultValue={state.currentCar.name}
                                    className={styles.selectHor}>
                                {cars.map((car) => {
                                    return (<option key={car.name}>{car.name}</option>)
                                })}
                            </select>
                            <select onChange={onHouseChangeHandler} defaultValue={state.currentHouse.name}
                                    className={styles.selectHor}>
                                {houses.map((house) => {
                                    return (<option key={house.name}>{house.name}</option>)
                                })}
                            </select>
                        </>
                    ) : null}
                    <button className={styles.button} onClick={onAddDataClickHandler}>
                        <FontAwesomeIcon icon={faAdd}/>
                    </button>
                </div>
                :
                <div className={styles.mainContainerVert}>
                    <menu className={styles.menu}>
                        <div className={styles.menuItem}>
                            <select onChange={onCarChangeHandler} defaultValue={state.currentCar.name}
                                    className={styles.select}>
                                {cars.map((car) => {
                                    return (<option key={car.name}>{car.name}</option>)
                                })}
                            </select>
                        </div>
                        <div className={styles.menuItem}>
                            <select onChange={onHouseChangeHandler}
                                    defaultValue={state.currentHouse.name}
                                    className={styles.select}>
                                {houses.map((house) => {
                                    return (<option key={house.name}>{house.name}</option>)
                                })}
                            </select>
                        </div>
                        <div className={styles.menuItem}>
                            <CustomSelect
                                onChange={onHouseChangeHandler}
                                defaultValue={state.currentHouse.name}
                                classname={""}
                                options={houses.map((house) => house.name)}
                            />
                        </div>
                        <div onClick={onAddDataClickHandler} className={styles.menuItem}>
                            <FontAwesomeIcon icon={faAdd}/>
                        </div>
                        <div onClick={onExportAsCsvClickHandler} className={styles.menuItem}>
                            <FontAwesomeIcon icon={faFileCsv}/>
                        </div>
                        <Link href={PATH_STRINGS.buildingConsumption} className={styles.menuItem}>
                            <FontAwesomeIcon icon={faHouseFire}/>
                        </Link>
                        <div onClick={onLogoutHandler} className={styles.menuItem}>
                            <FontAwesomeIcon icon={faPowerOff}/>
                        </div>

                    </menu>
                </div>}

        </>
    )
}

export type HeaderProps = {}
