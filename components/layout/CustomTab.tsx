import React from 'react';
import styles from '../../styles/layout/CustomTab.module.css'


export default function CustomTab({tabNames, setSelected, selected}: CustomTabProps) {
    return (
        <div className={styles.mainContainer}>
            {tabNames.map((tab, index) =>
                <div
                    className={`${styles.tabContainer} ${index === selected ? styles.tabSelected : ""}`}
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
