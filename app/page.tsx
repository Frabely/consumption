'use client'

import styles from '../styles/page.module.css'
import firebaseApp from "@/firebase/firebase";
import {getFirestore} from "@firebase/firestore";
import Header from "@/components/layout/Header";
import Display from "@/components/Display";
import {RootState} from "@/store/store";
import {useDispatch, useSelector} from "react-redux";
import AddDataModal from "@/components/AddDataModal";
import {getFullDataSet} from "@/firebase/functions";
import {setDataSetArray} from "@/store/reducer/currentDataSet";
import {useEffect} from "react";

export default function Home() {
    const dispatch = useDispatch()
    const state: RootState = useSelector((state: RootState) => state)
    useEffect(() => {
        getFullDataSet().then((dataSet) => {
                dispatch(setDataSetArray(dataSet ? dataSet : []))
            }
        ).catch((error) => {
            console.log(error.message)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const db = getFirestore(firebaseApp)

    return (
        <div>
            <Header/>
            {state.isAddingDataModalActive ? (
                <AddDataModal/>
            ) : null}
            <Display/>
        </div>
    )
}
