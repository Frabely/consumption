import styles from '../styles/ListItem.module.css'
import de from '../constants/de.json'
import {setDate} from "@/store/reducer/modal/date";
import {setKilometer} from "@/store/reducer/modal/kilometer";
import {setPower} from "@/store/reducer/modal/power";
import {setModalState} from "@/store/reducer/modalState";
import {setIsChangingData} from "@/store/reducer/isChangingData";
import {setId} from "@/store/reducer/modal/id";
import {setLoadingStation} from "@/store/reducer/modal/loadingStationId";
import {Language, LoadingStation} from "@/constants/types";
import {getDateString, getUTCDateString} from "@/constants/globalFunctions";
import {ModalState} from "@/constants/enums";
import {useAppDispatch} from "@/store/hooks";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBolt} from "@fortawesome/free-solid-svg-icons";

export default function ListItem({kilometer, name, power, date, id, isLight, loadingStation, isFirstElement}: ListItemProps) {
    const language: Language = de
    const dispatch = useAppDispatch()
    const localDateString: string = getDateString(date)
    const UTCDateString: string = getUTCDateString(date)
    let timeOut: ReturnType<typeof setTimeout> | undefined
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
                 if (timeOut) {
                     clearTimeout(timeOut)
                 }
             }}
             onMouseDown={touchStart}
             onMouseUp={() => {
                 if (timeOut) {
                     clearTimeout(timeOut)
                 }
             }}
             className={isLight ? styles.mainContainerLight : styles.mainContainerDark}>
            <div className={styles.topRow}>
                <div className={styles.leftSide}>
                    <div className={styles.iconBubble}>
                        <FontAwesomeIcon icon={faBolt} className={styles.icon}/>
                    </div>
                    <div className={styles.dateColumn}>
                        <div className={styles.primaryDate}>{localDateString}</div>
                        <div className={styles.secondaryDate}>{UTCDateString}</div>
                    </div>
                </div>
                <div className={styles.valueColumn}>
                    <div className={styles.kmValue}>{kilometer} {language.displayLabels.kilometerShort}</div>
                    <div className={styles.powerValue}>{power} {language.displayLabels.powerShort}</div>
                </div>
            </div>
            <div className={styles.bottomRow}>
                <div className={styles.stationValue}>{language.displayLabels.loadingStation}: {language.loadingStation[`${loadingStation.name}`]}</div>
                <div className={styles.nameValue}>{name}</div>
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
