import styles from '../styles/Display.module.css'
import ListItem from "@/components/ListItem";

export default function Display({}: DisplayProps) {

    return (
        <div className={styles.mainContainer}>
            <ListItem name={"Moritz"} date={"24/05/2023"} time={"12:44"} kilometer={122000} power={23.5}></ListItem>
            <ListItem name={"Moritz"} date={"24/05/2023"} time={"12:44"} kilometer={122000} power={23.5}></ListItem>
            <ListItem name={"Moritz"} date={"24/05/2023"} time={"12:44"} kilometer={122000} power={23.5}></ListItem>
        </div>
    )
}

export type DisplayProps = {}
