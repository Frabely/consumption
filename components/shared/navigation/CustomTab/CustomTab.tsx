import React from 'react';
import styles from './CustomTab.module.css'


export default function CustomTab({tabNames, setSelected, selected}: CustomTabProps) {
    return (
        <div className={styles.mainContainer} role={"tablist"} aria-label={"Home tabs"}>
            {tabNames.map((tab, index) => (
                <button
                    type={"button"}
                    role={"tab"}
                    aria-selected={index === selected}
                    className={`${styles.tabContainer} ${index === selected ? styles.tabSelected : ""}`}
                    key={index}
                    onClick={() => setSelected(index)}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
}

export type CustomTabProps = {
    tabNames: string[],
    setSelected: (value: React.SetStateAction<number>) => void,
    selected: number
}
