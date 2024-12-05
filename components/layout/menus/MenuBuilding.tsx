import React, {useState} from 'react';
import styles from '../../../styles/layout/menus/MenuBuilding.module.css'
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/store/store";
import globalMenuStyles from "@/styles/layout/menus/globalMenu.module.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEllipsis, faPowerOff, faXmark, faHouse} from "@fortawesome/free-solid-svg-icons";
import {EMPTY_USER, houses} from "@/constants/constantData";

import {setCurrentUser} from "@/store/reducer/currentUser";
import {setModalStateNone} from "@/store/reducer/modalState";
import Link from "next/link";
import {setCurrentHouse} from "@/store/reducer/currentHouse";
import CustomSelect from "@/components/layout/CustomSelect";

export default function MenuBuilding({}: MenuBuildingProps) {
    const dispatch = useDispatch()
    const state: RootState = useSelector((state: RootState) => state)
    const [menuOpen, setMenuOpen] = useState(false)

    const onLogoutHandler = () => {
        dispatch(setCurrentUser(EMPTY_USER))
        dispatch(setModalStateNone())
    }

    const onHomePageClickHandler = () => {
        dispatch(setModalStateNone())
    }

    const onHouseChangeHandler = (value: string) => {
        dispatch(setCurrentHouse(houses.filter(house => house.name === value)[0]))
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
                            <div onClick={onLogoutHandler} className={globalMenuStyles.button}>
                                <FontAwesomeIcon icon={faPowerOff}/>
                            </div>
                            <CustomSelect
                                onChange={onHouseChangeHandler}
                                defaultValue={state.currentHouse.name}
                                options={houses.map((house) => house.name)}
                                direction={"up"}
                            />
                        </>
                    ) : null}
                    <Link href={"/"} className={globalMenuStyles.button} onClick={onHomePageClickHandler}>
                        <FontAwesomeIcon icon={faHouse}/>
                    </Link>
                </div>
                :
                <div className={globalMenuStyles.mainContainerVert}>
                    <menu className={globalMenuStyles.menu}>
                        <Link href={"/"} className={globalMenuStyles.menuItem} onClick={onHomePageClickHandler}>
                            <FontAwesomeIcon icon={faHouse}/>
                        </Link>
                        <CustomSelect
                            onChange={onHouseChangeHandler}
                            defaultValue={state.currentHouse.name}
                            options={houses.map((house) => house.name)}/>
                        <div onClick={onLogoutHandler} className={globalMenuStyles.menuItem}>
                            <FontAwesomeIcon icon={faPowerOff}/>
                        </div>
                    </menu>
                </div>
            }
        </>
    );
}

export type MenuBuildingProps = {}
