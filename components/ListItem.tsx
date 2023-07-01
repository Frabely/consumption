import styles from '../styles/ListItem.module.css'
import de from '../constants/de.json'
import {useDispatch} from "react-redux";
import {setDate} from "@/store/reducer/modal/date";
import {setTime} from "@/store/reducer/modal/time";
import {setKilometer} from "@/store/reducer/modal/kilometer";
import {setPower} from "@/store/reducer/modal/power";
import {invertIsAddingDataModalActive} from "@/store/reducer/isAddingDataModalActive";
import {setIsChangingData} from "@/store/reducer/isChangingData";
import {setId} from "@/store/reducer/modal/id";
import {setLoadingStation} from "@/store/reducer/modal/loadingStationId";
import {LoadingStation} from "@/constants/types";

export default function ListItem({kilometer, name, power, time, date, id, isLight, loadingStation}: ListItemProps) {
    const dispatch = useDispatch()
    let timeOut: any
    const touchStart = () => {
        timeOut = setTimeout(() => {
            dispatch(setIsChangingData(true))
            const millisecondsToMinutes = 60000
            const timeParts: string[] = time.split(':')
            const dateParts: string[] = date.split('-')
            const currDate = new Date()
            const selectedDate = new Date(
                parseInt(dateParts[0]),
                parseInt(dateParts[1]) - 1,
                parseInt(dateParts[2]),
                parseInt(timeParts[0]),
                parseInt(timeParts[1])
            )
            const diffMinutes: number =
                Math.floor(currDate.getTime() / millisecondsToMinutes) -
                Math.floor(selectedDate.getTime() / millisecondsToMinutes)
            if (diffMinutes < 5) {
                dispatch(invertIsAddingDataModalActive())
                dispatch(setTime(time))
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
                <div>
                    <div className={styles.item}>{date}</div>
                    <div className={styles.item}>{de.measureUnits.local} {time} {de.measureUnits.time}</div>
                    {/*<div className={styles.item}>{de.measureUnits.UTC} {time} {de.measureUnits.time}</div>*/}
                </div>
                <div>
                    <div className={styles.item}>{kilometer} {de.measureUnits.kilometer}</div>
                    <div className={styles.item}>{power} {de.measureUnits.power}</div>
                    <div className={styles.item}>{loadingStation.name}</div>
                </div>
            </div>
            <div className={styles.itemName}>{name}</div>
        </div>
    )
}

export type ListItemProps = {
    isLight: boolean
    time: string,
    date: string,
    kilometer: number,
    power: number,
    name: string,
    id: string,
    loadingStation: LoadingStation
}
