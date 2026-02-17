'use client'

import styles from '../styles/page.module.css'
import {RootState} from "@/store/store";
import {useSelector} from "react-redux";
import img from "@/public/bg_vert.jpg";
import Image from "next/image";
import {setDimension} from "@/store/reducer/dimension";
import {useEffect} from "react";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import {useAppDispatch} from "@/store/hooks";
import Home from "@/components/pages/Home";
import {Page} from "@/constants/enums";
import BuildingConsumption from "@/components/pages/BuildingConsumption";

export default function App() {
    const state: RootState = useSelector((state: RootState) => state)
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
                state.currentPage === Page.Home ?
                    <Home/> :
                    <BuildingConsumption/>
            }
        </div>
    )
}
