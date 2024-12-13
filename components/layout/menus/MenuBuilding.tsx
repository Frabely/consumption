import React, {useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/store/store";
import globalMenuStyles from "@/styles/layout/menus/globalMenu.module.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEllipsis, faPowerOff, faXmark, faHouse} from "@fortawesome/free-solid-svg-icons";
import {setCurrentUser} from "@/store/reducer/currentUser";
import {setModalStateNone} from "@/store/reducer/modalState";
import {setCurrentHouse} from "@/store/reducer/currentHouse";
import CustomSelect from "@/components/layout/CustomSelect";
import {setIsLoading} from "@/store/reducer/isLoading";
import {EMPTY_USER} from "@/constants/constantData";
import {House} from "@/constants/types";
import {setPage} from "@/store/reducer/currentPage";
import {Page} from "@/constants/enums";

export default function MenuBuilding({houses}: MenuBuildingProps) {
    const dispatch = useDispatch()
    const state: RootState = useSelector((state: RootState) => state)
    const [menuOpen, setMenuOpen] = useState(false)

    const onLogoutHandler = () => {
        dispatch(setCurrentUser(EMPTY_USER))
        dispatch(setModalStateNone())
        dispatch(setPage(Page.Home))
    }

    const onHomePageClickHandler = () => {
        dispatch(setModalStateNone())
        dispatch(setIsLoading(true))
        dispatch(setPage(Page.Home))
    }

    const onHouseChangeHandler = (value: string) => {
        dispatch(setCurrentHouse(houses.filter(house => house.name === value)[0]))
    }

    return (
        <>
            {state.dimension.isHorizontal ?
                <div className={globalMenuStyles.mainContainerHor}>
                    <button
                        className={globalMenuStyles.button}
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
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
                    <button
                        className={globalMenuStyles.button}
                        onClick={onHomePageClickHandler}
                    >
                        <FontAwesomeIcon icon={faHouse}/>
                    </button>
                </div>
                :
                <div className={globalMenuStyles.mainContainerVert}>
                    <menu className={globalMenuStyles.menu}>
                        <button
                            className={globalMenuStyles.menuItem}
                            onClick={onHomePageClickHandler}
                        >
                            <FontAwesomeIcon icon={faHouse}/>
                        </button>
                        <CustomSelect
                            onChange={onHouseChangeHandler}
                            defaultValue={state.currentHouse.name}
                            options={houses.map((house) => house.name)}/>
                        <button
                            onClick={onLogoutHandler}
                            className={globalMenuStyles.menuItem}
                        >
                            <FontAwesomeIcon icon={faPowerOff}/>
                        </button>
                    </menu>
                </div>
            }
        </>
    );
}

export type MenuBuildingProps = {
    houses: House[]
}
