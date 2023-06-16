import styles from '../styles/ListItem.module.css'
import {useDispatch} from "react-redux";
import {setDate} from "@/store/reducer/modal/date";
import {setTime} from "@/store/reducer/modal/time";
import {setKilometer} from "@/store/reducer/modal/kilometer";
import {setPower} from "@/store/reducer/modal/power";
import {invertIsAddingDataModalActive} from "@/store/reducer/isAddingDataModalActive";
import {removeDataSet} from "@/store/reducer/currentDataSet";

export default function ListItem({kilometer, name, power, time, date}: ListItemProps) {
    const dispatch = useDispatch()
    let timeOut: any
    const touchStart = () => {
        timeOut = setTimeout(() => {
            dispatch(removeDataSet({
                date,
                time,
                kilometer,
                power,
                name,
            }))
        },500)
    }
    const onListItemClickHandler = () => {
        dispatch(setTime(time))
        dispatch(setDate(date))
        dispatch(setKilometer(kilometer))
        dispatch(setPower(power))
        dispatch(invertIsAddingDataModalActive())
    }

    return (
        <div onTouchStart={touchStart}
             onTouchEnd={() => {clearTimeout(timeOut)}}
             onMouseDown={touchStart}
             onMouseUp={() => {clearTimeout(timeOut)}}
             onClick={onListItemClickHandler}
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
    name: string
}
