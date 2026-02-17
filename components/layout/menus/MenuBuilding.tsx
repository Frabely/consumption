import React, {useState} from 'react';
import {RootState} from "@/store/store";
import globalMenuStyles from "@/styles/layout/menus/globalMenu.module.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEllipsis, faPowerOff, faXmark, faHouse, faFileCsv} from "@fortawesome/free-solid-svg-icons";
import {setCurrentUser} from "@/store/reducer/currentUser";
import {setModalState, setModalStateNone} from "@/store/reducer/modalState";
import {setCurrentHouse} from "@/store/reducer/currentHouse";
import CustomSelect from "@/components/layout/CustomSelect";
import {setIsLoading} from "@/store/reducer/isLoading";
import {EMPTY_USER} from "@/constants/constantData";
import {House} from "@/constants/types";
import {setPage} from "@/store/reducer/currentPage";
import {ModalState, Page} from "@/constants/enums";
import {useAppDispatch, useAppSelector} from "@/store/hooks";

export default function MenuBuilding({houses}: MenuBuildingProps) {
    const dispatch = useAppDispatch()
    const isHorizontal: boolean = useAppSelector((state: RootState) => state.dimension.isHorizontal)
    const currentHouseName: string | undefined = useAppSelector((state: RootState) => state.currentHouse.name)
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

    const onExportAsCsvClickHandler = () => {
        dispatch(setModalStateNone())
        dispatch(setModalState(ModalState.DownloadBuildingCsv))
    }

    return (
        <>
            {isHorizontal ?
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
                            <button onClick={onExportAsCsvClickHandler} className={globalMenuStyles.button}>
                                <FontAwesomeIcon icon={faFileCsv}/>
                            </button>
                            <CustomSelect
                                onChange={onHouseChangeHandler}
                                defaultValue={currentHouseName}
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
                            defaultValue={currentHouseName}
                            options={houses.map((house) => house.name)}/>
                        <button onClick={onExportAsCsvClickHandler} className={globalMenuStyles.menuItem}>
                            <FontAwesomeIcon icon={faFileCsv}/>
                        </button>
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
    houses: House[],
}
