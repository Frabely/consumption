import {DB_LOADING_STATIONS} from "@/constants/constantData";
import {LoadingStation} from "@/constants/types";
import {collection, getDocs} from "@firebase/firestore";
import {db} from "@/firebase/db";

export const getLoadingStations = async () => {
    const loadingStations: LoadingStation[] = [];
    const consumptionDataRef = collection(db, `${DB_LOADING_STATIONS}`);
    const qsDocs = await getDocs(consumptionDataRef).catch(error => {
        console.error(error.message);
    });
    if (qsDocs && !qsDocs.empty) {
        qsDocs.docs.map((loadingStation) => {
            const newLoadingStation: LoadingStation = {
                id: loadingStation.id,
                name: loadingStation.get("name")
            };
            loadingStations.push(newLoadingStation);
        });
        return loadingStations;
    }
};
