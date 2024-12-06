import React from 'react';
import styles from './../styles/Loading.module.css'
import de from "@/constants/de.json";

export default function Loading({}: LoadingProps) {
    return (
        <div className={styles.isLoadingContainer}>
            <div className={styles.isLoading}>
                <div className={styles.spinner}></div>
                <span>{de.displayLabels.loading}...</span>
            </div>
        </div>
    );
}

export type LoadingProps = {}
