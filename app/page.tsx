import styles from '../styles/page.module.css'
import firebaseApp from "@/firebase/firebase";
import {getFirestore} from "@firebase/firestore";
import Header from "@/components/layout/Header";
import Display from "@/components/Display";

export default function Home() {
    const db = getFirestore(firebaseApp)

    return (
        <div>
            <Header/>
            <Display/>
        </div>
    )
}
