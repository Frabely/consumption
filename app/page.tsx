'use client'

import styles from '../styles/page.module.css'
import firebaseApp from "@/firebase/firebase";
import {getFirestore} from "@firebase/firestore";
import Header from "@/components/layout/Header";
import Display from "@/components/Display";
import {RootState} from "@/store/store";
import {useSelector} from "react-redux";
import AddDataModal from "@/components/AddDataModal";

export default function Home() {
    // const db = getFirestore(firebaseApp)
    const state: RootState = useSelector((state: RootState) => state)

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
