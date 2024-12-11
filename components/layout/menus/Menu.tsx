'use client'

import globalMenuStyles from '../../../styles/layout/menus/globalMenu.module.css'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faAdd, faEllipsis, faFileCsv, faHouseFire, faPowerOff, faXmark} from '@fortawesome/free-solid-svg-icons'
import {useDispatch, useSelector} from "react-redux";
import {setModalState, setModalStateNone} from "@/store/reducer/modalState";
import {setIsChangingData} from "@/store/reducer/isChangingData";
import {setCurrentUser} from "@/store/reducer/currentUser";
import {cars, EMPTY_USER, PATH_STRINGS} from "@/constants/constantData";
import {RootState} from "@/store/store";
import React, {useState} from "react";
import {setCurrentCar} from "@/store/reducer/currentCar";
import {getCars} from "@/firebase/functions";
import Link from "next/link";
import CustomSelect from "@/components/layout/CustomSelect";
import {ModalState, Role} from "@/constants/enums";

export default function Menu({}: MenuProps) {
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

    const onCarChangeHandler = (value: string) => {
        getCars().then((result) => {
            if (result) {
                dispatch(setCurrentCar(result.filter(car => car.name === value)[0]))
            }
        }).catch((error: Error) => {
            console.log(error.message)
        })
    }

    return (
        <>
            {state.dimension.isHorizontal ?
                <div className={globalMenuStyles.mainContainerHor}>
                    <button className={globalMenuStyles.button} onClick={() => setMenuOpen(!menuOpen)}>
                        <FontAwesomeIcon icon={menuOpen ? faXmark : faEllipsis}/>
                    </button>
                    {menuOpen ? (
                        <>
                            <button onClick={onLogoutHandler} className={globalMenuStyles.button}>
                                <FontAwesomeIcon icon={faPowerOff}/>
                            </button>
                            <button onClick={onExportAsCsvClickHandler} className={globalMenuStyles.button}>
                                <FontAwesomeIcon icon={faFileCsv}/>
                            </button>
                            {
                                state.currentUser.role === Role.Admin ?
                                    <Link href={PATH_STRINGS.buildingConsumption} className={globalMenuStyles.button}>
                                        <FontAwesomeIcon icon={faHouseFire}/>
                                    </Link> :
                                    null
                            }
                            <CustomSelect
                                onChange={onCarChangeHandler}
                                defaultValue={state.currentCar.name}
                                options={cars.map((car) => car.name)}
                                direction={"up"}
                            />
                        </>
                    ) : null}
                    <button className={globalMenuStyles.button} onClick={onAddDataClickHandler}>
                        <FontAwesomeIcon icon={faAdd}/>
                    </button>
                </div>
                :
                <div className={globalMenuStyles.mainContainerVert}>
                    <menu className={globalMenuStyles.menu}>
                        <CustomSelect
                            onChange={onCarChangeHandler}
                            defaultValue={state.currentCar.name}
                            options={cars.map((car) => car.name)}
                        />
                        <div onClick={onAddDataClickHandler} className={globalMenuStyles.menuItem}>
                            <FontAwesomeIcon icon={faAdd}/>
                        </div>
                        <div onClick={onExportAsCsvClickHandler} className={globalMenuStyles.menuItem}>
                            <FontAwesomeIcon icon={faFileCsv}/>
                        </div>
                        {
                            state.currentUser.role === Role.Admin ?
                                <Link href={PATH_STRINGS.buildingConsumption} className={globalMenuStyles.menuItem}>
                                    <FontAwesomeIcon icon={faHouseFire}/>
                                </Link> :
                                null
                        }
                        <div onClick={onLogoutHandler} className={globalMenuStyles.menuItem}>
                            <FontAwesomeIcon icon={faPowerOff}/>
                        </div>
                    </menu>
                </div>}
        </>
    )
}

export type MenuProps = {}
