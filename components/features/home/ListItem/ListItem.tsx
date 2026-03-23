import styles from './ListItem.module.css'
import de from "@/i18n"
import {setIsChangingData} from "@/store/reducer/isChangingData";
import type {LoadingStation} from "@/common/models";
import type {Translations} from "@/i18n/types";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBolt} from "@fortawesome/free-solid-svg-icons";
import {
    dispatchChangeDataActions,
    formatLoadingSessionRange,
    formatListItemDateTime,
    formatListItemPower,
    isChangeCarDataAllowed
} from "@/components/features/home/ListItem/ListItem.logic";
import {selectCurrentUser} from "@/store/selectors";

/**
 * Renders a single consumption-data list item and opens edit mode on long press when allowed.
 * @param props Visual and domain data required for the list row.
 * @returns The rendered list item element.
 */
export default function ListItem({kilometer, name, power, date, started, ended, id, isLight, loadingStation, isFirstElement}: ListItemProps) {
    const language: Translations = de
    const dispatch = useAppDispatch()
    const currentUser = useAppSelector(selectCurrentUser)
    const recordedAt = formatListItemDateTime(date, language.displayLabels.none)
    const loadingSessionRange = formatLoadingSessionRange(started, ended, language.displayLabels.none)
    const formattedPower = formatListItemPower(power)
    const loadingStationLabel =
        language.loadingStation[loadingStation.name as keyof typeof language.loadingStation] ?? loadingStation.name
    let timeOut: ReturnType<typeof setTimeout> | undefined
    const touchStart = () => {
        timeOut = setTimeout(() => {
            dispatch(setIsChangingData(true))
            if (isChangeCarDataAllowed({isFirstElement, dataSetDate: date, currentUserRole: currentUser.role})) {
                dispatchChangeDataActions({
                    dispatch,
                    date,
                    started,
                    ended,
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
                        <div className={styles.primaryDate}>{language.displayLabels.recordedAt}</div>
                        <div className={styles.secondaryDate}>{recordedAt}</div>
                        <div className={styles.primaryDate}>{language.displayLabels.loadingProcess}</div>
                        <div className={styles.secondaryDate}>{loadingSessionRange}</div>
                    </div>
                </div>
                <div className={styles.valueColumn}>
                    <div className={styles.kmValue}>{kilometer} {language.displayLabels.kilometerShort}</div>
                    <div className={styles.powerValue}>{formattedPower} {language.displayLabels.powerShort}</div>
                </div>
            </div>
            <div className={styles.bottomRow}>
                <div className={styles.stationValue}>{language.displayLabels.loadingStation}: {loadingStationLabel}</div>
                <div className={styles.nameValue}>{name}</div>
            </div>
        </div>
    )
}

export type ListItemProps = {
    isLight: boolean
    date: Date,
    started?: Date,
    ended?: Date,
    kilometer: number,
    power: number,
    name: string,
    id: string,
    loadingStation: LoadingStation,
    isFirstElement: boolean
}



