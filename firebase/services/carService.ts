import {DB_CARS} from "@/constants/constantData";
import {Car} from "@/common/models";
import {collection, getDocs} from "@firebase/firestore";
import {db} from "@/firebase/db";
import {E2E_MOCK_CARS, isE2EMockModeEnabled} from "@/firebase/services/e2eMockData";

export const getCars = async () => {
    if (isE2EMockModeEnabled()) {
        return E2E_MOCK_CARS;
    }

    const cars: Car[] = [];
    const carsRef = collection(db, `${DB_CARS}`);
    const qsDocs = await getDocs(carsRef).catch(error => {
        console.error(error.message);
    });
    if (qsDocs && !qsDocs.empty) {
        qsDocs.docs.forEach((car) => {
            const newCar: Car = {
                name: car.id,
                kilometer: car.get("kilometer"),
                prevKilometer: car.get("prevKilometer")
            };
            cars.push(newCar);
        });
    }
    return cars;
};

