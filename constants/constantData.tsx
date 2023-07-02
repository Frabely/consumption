import {Car, DataSet, LoadingStation, User} from "@/constants/types";
import {getCars, getLoadingStations} from "@/firebase/functions";
export const DEFAULT_LOADING_STATION: LoadingStation = {
    id: '17498904',
    name: 'carport'
}
export const EMPTY_DATA_SET: DataSet = {
    id: '',
    date: '',
    time: '',
    kilometer: 0,
    power: 0,
    name: '',
    loadingStation: DEFAULT_LOADING_STATION
}

export let DEFAULT_CAR: Car = {
    name: 'Zoe'
}

export const EMPTY_USER: User = {}

export const DB_DATA_SET_COLLECTION_KEY: string = 'consumptionData'
export const DB_USER_COLLECTION_KEY: string = 'users'
export const DB_CARS: string = 'cars'

export const DB_LOADING_STATIONS: string = 'loadingStations'

export let loadingStations: LoadingStation[]
getLoadingStations().then((result) => {
    if (result) {
        loadingStations = result
    }
}).catch((error: Error) => {
    console.log(error.message)
})

export let cars: Car[]

getCars().then((result) => {
    if (result) {
        cars = result
        DEFAULT_CAR = {
            name: cars[0].name,
            kilometer: cars[0].kilometer,
            prevKilometer: cars[0].prevKilometer,
        }
    }
}).catch((error: Error) => {
    console.log(error.message)
})



