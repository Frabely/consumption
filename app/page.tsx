'use client'

import styles from '../styles/page.module.css'
import img from "@/public/bg_vert.jpg";
import Image from "next/image";
import {setDimension} from "@/store/reducer/dimension";
import {useEffect} from "react";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import Home from "@/components/features/home/pages/Home";
import {Page} from "@/constants/enums";
import BuildingConsumption from "@/components/pages/BuildingConsumption";
import {selectCurrentPage} from "@/store/selectors";

export default function App() {
    const currentPage = useAppSelector(selectCurrentPage)
    const dispatch = useAppDispatch()
    const dimension = useWindowDimensions()

    useEffect(() => {
        dispatch(setDimension(dimension));
    }, [dimension, dispatch]);


    return (
        <div className={styles.mainContainer}>
            <Image className={styles.image} src={img} alt={''}/>
            <div className={styles.imageFilter}/>
            {
                currentPage === Page.Home ?
                    <Home/> :
                    <BuildingConsumption/>
            }
        </div>
    )
}
