import styles from '../styles/ListItem.module.css'

export default function ListItem({date,kilometer,name,power,time}: ListItemProps) {

    return (
        <div className={styles.mainContainer}>
            <div className={styles.item}>{date}</div>
            <div className={styles.item}>{time}</div>
            <div className={styles.item}>{kilometer}</div>
            <div className={styles.item}>{power}</div>
            <div className={styles.item}>{name}</div>
        </div>
    )
}

export type ListItemProps = {
    date: string,
    time: string,
    kilometer: number,
    power: number,
    name: string
}
