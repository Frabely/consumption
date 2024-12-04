import styles from '../styles/ListItem.module.css'
import de from '../constants/de.json'
import {useDispatch} from "react-redux";
import {setDate} from "@/store/reducer/modal/date";
import {setKilometer} from "@/store/reducer/modal/kilometer";
import {setPower} from "@/store/reducer/modal/power";
import {setModalState} from "@/store/reducer/isModalActive";
import {setIsChangingData} from "@/store/reducer/isChangingData";
import {setId} from "@/store/reducer/modal/id";
import {setLoadingStation} from "@/store/reducer/modal/loadingStationId";
import {Language, LoadingStation} from "@/constants/types";
import {getDateString, getUTCDateString} from "@/constants/globalFunctions";
import {ModalState} from "@/constants/enums";

export default function ListItem({kilometer, name, power, date, id, isLight, loadingStation, isFirstElement}: ListItemProps) {
    const language: Language = de
    const dispatch = useDispatch()
    const localDateString: string = getDateString(date)
    const UTCDateString: string = getUTCDateString(date)
    let timeOut: any
    const touchStart = () => {
        timeOut = setTimeout(() => {
            dispatch(setIsChangingData(true))
            const millisecondsToMinutes = 60000
            const currDate = new Date()
            const diffMinutes: number =
                Math.floor(currDate.getTime() / millisecondsToMinutes) -
                Math.floor(date.getTime() / millisecondsToMinutes)
            if (isFirstElement && diffMinutes < 5) {
                dispatch(setModalState(ModalState.ChangeCarData))
                dispatch(setDate(date))
                dispatch(setKilometer(kilometer.toString()))
                dispatch(setPower(power.toString()))
                dispatch(setId(id))
                dispatch(setLoadingStation(loadingStation))
            }
        }, 500)
    }

    return (
        <div onTouchStart={touchStart}
             onTouchEnd={() => {
                 clearTimeout(timeOut)
             }}
             onMouseDown={touchStart}
             onMouseUp={() => {
                 clearTimeout(timeOut)
             }}
             className={isLight ? styles.mainContainerLight : styles.mainContainerDark}>
            <div className={styles.statsContainer}>
                <div className={styles.innerContainer}>
                    <div className={styles.item}>{language.displayLabels.local}:</div>
                    <div className={styles.item}>{localDateString}</div>
                </div>
                <div className={styles.innerContainer}>
                    <div className={styles.item}>{language.displayLabels.UTC}:</div>
                    <div className={styles.item}>{UTCDateString}</div>
                </div>
                <div className={styles.innerContainer}>
                    <div className={styles.item}>{language.displayLabels.kilometer}:</div>
                    <div className={styles.item}>{kilometer} {language.displayLabels.kilometerShort}</div>
                </div>
                <div className={styles.innerContainer}>
                    <div className={styles.item}>{language.displayLabels.power}:</div>
                    <div className={styles.item}>{power} {language.displayLabels.powerShort}</div>
                </div>
                <div className={styles.innerContainer}>
                    <div className={styles.item}>{language.displayLabels.loadingStation}:</div>
                    <div className={styles.item}>{language.loadingStation[`${loadingStation.name}`]}</div>
                </div>
                <div className={styles.innerContainer}>
                    <div className={styles.item}>{language.displayLabels.name}:</div>
                    <div className={styles.item}>{name}</div>
                </div>
            </div>
        </div>
    )
}

export type ListItemProps = {
    isLight: boolean
    date: Date,
    kilometer: number,
    power: number,
    name: string,
    id: string,
    loadingStation: LoadingStation,
    isFirstElement: boolean
}
