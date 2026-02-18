import styles from './ListItem.module.css'
import de from "@/constants/de.json"
import {setIsChangingData} from "@/store/reducer/isChangingData";
import {Language, LoadingStation} from "@/constants/types";
import {getDateString} from "@/constants/globalFunctions";
import {useAppDispatch} from "@/store/hooks";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBolt} from "@fortawesome/free-solid-svg-icons";
import {dispatchChangeDataActions, isChangeCarDataAllowed} from "@/components/features/home/ListItem/ListItem.logic";

export default function ListItem({kilometer, name, power, date, id, isLight, loadingStation, isFirstElement}: ListItemProps) {
    const language: Language = de
    const dispatch = useAppDispatch()
    const [localDate, localTime] = getDateString(date).split(" ")
    let timeOut: ReturnType<typeof setTimeout> | undefined
    const touchStart = () => {
        timeOut = setTimeout(() => {
            dispatch(setIsChangingData(true))
            if (isChangeCarDataAllowed({isFirstElement, dataSetDate: date})) {
                dispatchChangeDataActions({
                    dispatch,
                    date,
                    kilometer,
                    power,
                    id,
                    loadingStation
                })
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
                        <div className={styles.primaryDate}>{localDate}</div>
                        <div className={styles.secondaryDate}>{localTime}</div>
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
