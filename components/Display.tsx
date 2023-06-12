import styles from '../styles/Display.module.css'
import ListItem from "@/components/ListItem";

export default function Display({}: DisplayProps) {

    return (
        <div className={styles.mainContainer}>
            <div className={styles.list}>
                <ListItem name={"Moritz"} date={"24/05/2023"} time={"12:44"} kilometer={122000} power={23.5}></ListItem>
                <ListItem name={"Moritz"} date={"24/05/2023"} time={"12:44"} kilometer={122000} power={23.5}></ListItem>
                <ListItem name={"Moritz"} date={"24/05/2023"} time={"12:44"} kilometer={122000} power={23.5}></ListItem>
            </div>
        </div>
    )
}

export type DisplayProps = {}
