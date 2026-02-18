import React from 'react';
import styles from './Loading.module.css'
import de from "@/constants/de.json";
import {buildLoadingText} from "@/components/features/home/Loading/Loading.logic";

export default function Loading({}: LoadingProps) {
    return (
        <div className={styles.isLoadingContainer}>
            <div className={styles.isLoading}>
                <div className={styles.spinner}></div>
                <span>{buildLoadingText(de)}</span>
            </div>
        </div>
    );
}

export type LoadingProps = {}
