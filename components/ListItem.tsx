import styles from '../styles/ListItem.module.css'
import {useDispatch} from "react-redux";
import {setDate} from "@/store/reducer/modal/date";
import {setTime} from "@/store/reducer/modal/time";
import {setKilometer} from "@/store/reducer/modal/kilometer";
import {setPower} from "@/store/reducer/modal/power";
import {invertIsAddingDataModalActive} from "@/store/reducer/isAddingDataModalActive";
import {setIsChangingData} from "@/store/reducer/isChangingData";

export default function ListItem({kilometer, name, power, time, date, id}: ListItemProps) {
    //TODO add touch event for mobile phone
    const dispatch = useDispatch()
    let timeOut: any
    const touchStart = () => {
        timeOut = setTimeout(() => {
            const millisecondsToMinutes = 60000
            const timeParts: string[] = time.split(':')
            const dateParts: string[] = date.split('-')
            const currDate = new Date()
            const selectedDate = new Date(
                parseInt(dateParts[0]),
                parseInt(dateParts[1])-1,
                parseInt(dateParts[2]),
                parseInt(timeParts[0]),
                parseInt(timeParts[1])
            )
            const diffMinutes: number =
                Math.floor(currDate.getTime()/millisecondsToMinutes) -
                Math.floor(selectedDate.getTime()/millisecondsToMinutes)
            if (diffMinutes < 5 )
            {
                dispatch(invertIsAddingDataModalActive())
                dispatch(setTime(time))
                dispatch(setDate(date))
                dispatch(setKilometer(kilometer))
                dispatch(setPower(power))
                dispatch(setIsChangingData(true))
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
             className={styles.mainContainer}>
            <div className={styles.item}>{date}</div>
            <div className={styles.item}>{time}</div>
            <div className={styles.item}>{kilometer}</div>
            <div className={styles.item}>{power}</div>
            <div className={styles.item}>{name}</div>
        </div>
    )
}

export type ListItemProps = {
    time: string,
    date: string,
    kilometer: number,
    power: number,
    name: string,
    id: string
}
