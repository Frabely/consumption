import {DB_LOADING_STATIONS} from "@/constants/constantData";
import {LoadingStation} from "@/constants/types";
import {collection, getDocs} from "@firebase/firestore";
import {db} from "@/firebase/db";
import {E2E_MOCK_LOADING_STATIONS, isE2EMockModeEnabled} from "@/firebase/services/e2eMockData";

export const getLoadingStations = async () => {
    if (isE2EMockModeEnabled()) {
        return E2E_MOCK_LOADING_STATIONS;
    }

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
