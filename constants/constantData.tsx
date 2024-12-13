import {Car, DataSet, House, LoadingStation, User} from "@/constants/types";
import {getCars, getFullDataSet, getHouses, getLoadingStations} from "@/firebase/functions";

export const DEFAULT_LOADING_STATION: LoadingStation = {
    id: '17498904',
    name: 'carport'
}

export const DEFAULT_CAR_NAME = "Zoe"

export let DEFAULT_CAR: Car;

export let DEFAULT_HOUSE: House = {
    name: 'F233',
    flats: []
}

export const EMPTY_USER: User = {}

export const DB_DATA_SET_COLLECTION_KEY: string = 'consumptionData'
export const DB_DATA_FLATS_KEY: string = 'flats'
export const DB_DATA_ROOMS_KEY: string = 'rooms'
export const DB_USER_COLLECTION_KEY: string = 'users'
export const DB_CARS: string = 'cars'
export const DB_HOUSES: string = 'houses'
export const DB_FLATS: string = 'flats'
export const DB_ROOMS: string = 'rooms'
export const DB_BUILDING_CONSUMPTION: string = 'buildingConsumption'
export const DB_LOADING_STATIONS: string = 'loadingStations'

export let loadingStations: LoadingStation[] = []
export let cars: Car[] = []
export let houses: House[] = []
export let dataSet: DataSet[] = []

export const loadMainPageData = async () => {
    const resultStations = await getLoadingStations().catch((error: Error) => {
        console.log(error.message)
    })
    if (resultStations)
        loadingStations = resultStations

    const resultCars = await getCars().catch((error: Error) => {
        console.log(error.message)
    })
    if (resultCars) {
        cars = resultCars
        if (cars.length > 0) {
            cars.map((car) => {
                if (car.name === DEFAULT_CAR_NAME)
                    DEFAULT_CAR = {
                        name: car.name,
                        kilometer: car.kilometer,
                        prevKilometer: car.prevKilometer,
                    }
            })
            if (!DEFAULT_CAR)
            DEFAULT_CAR = {
                name: cars[0].name,
                kilometer: cars[0].kilometer,
                prevKilometer: cars[0].prevKilometer,
            }
            const resultDataSet = await getFullDataSet(DEFAULT_CAR.name)
                .catch((error: Error) => console.log(error.message))
            if (resultDataSet)
                dataSet = resultDataSet
        }
    }
}

export const loadHouses = async () => {
    return getHouses().then((housesResult) => {
        return housesResult
    })
}




