import styles from '../styles/Display.module.css'
import ListItem from "@/components/ListItem";
import {useSelector} from "react-redux";
import {RootState} from "@/store/store";
import {DataSet} from "@/constants/types";
import Image from "next/image";
import img from "../public/electric-car-2783573.jpg"

export default function Display({}: DisplayProps) {
    const state: RootState = useSelector((state: RootState) => state)
    // const array = state.currentDataSet.slice().reverse()
    return (
        <>
            <div className={styles.mainContainer}>
                <div className={styles.list}>
                    {state.currentDataSet.map((dataSet: DataSet, index: number) => (
                        <ListItem key={index}
                                  kilometer={dataSet.kilometer}
                                  date={dataSet.date}
                                  time={dataSet.time}
                                  name={dataSet.name}
                                  power={dataSet.power}
                                  id={dataSet.id}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}

export type DisplayProps = {}
