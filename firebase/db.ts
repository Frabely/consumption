import {getFirestore} from "@firebase/firestore";
import firebaseApp from "@/firebase/firebase";

export const db = getFirestore(firebaseApp);
