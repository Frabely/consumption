import React from 'react';
import styles from '../../styles/layout/CustomTab.module.css'
import {RootState} from "@/store/store";
import {useSelector} from "react-redux";


export default function CustomTab({tabNames, setSelected, selected}: CustomTabProps) {
    const isHorizontal: boolean = useSelector((state: RootState) => state.dimension.isHorizontal)

    return (
        <div className={styles.mainContainer} style={!isHorizontal ? {paddingTop: "10dvh"} : undefined}>
            {tabNames.map((tab, index) =>
                <div
                    className={styles.tabContainer}
                    style={index === selected ? {background: "var(--trans-display-color-dark)"}: {}}
                    key={index}
                    onClick={() => setSelected(index)}
                >
                    {tab}
                </div>
            )}
        </div>
    );
}

export type CustomTabProps = {
    tabNames: string[],
    setSelected: (value: React.SetStateAction<number>) => void,
    selected: number
}
