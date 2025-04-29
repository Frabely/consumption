import React from 'react';
import styles from '../../styles/layout/CustomTab.module.css'
import {RootState} from "@/store/store";
import {useSelector} from "react-redux";


export default function CustomTab({setSelected, selected}: CustomTabProps) {
    const testTabs = ["tab 1", "tab 2"]
    const isHorizontal: boolean = useSelector((state: RootState) => state.dimension.isHorizontal)

    return (
        <div className={styles.mainContainer} style={!isHorizontal ? {paddingTop: "10dvh"} : undefined}>
            {testTabs.map((tab, index) =>
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
    setSelected: (value: React.SetStateAction<number>) => void,
    selected: number
}
