import {DB_CARS} from "@/constants/constantData";
import {Car} from "@/constants/types";
import {collection, getDocs} from "@firebase/firestore";
import {db} from "@/firebase/db";

export const getCars = async () => {
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
