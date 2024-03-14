import {Car, DataSet, House, LoadingStation, User} from "@/constants/types";
import {getCars, getHouses, getLoadingStations} from "@/firebase/functions";
export const DEFAULT_LOADING_STATION: LoadingStation = {
    id: '17498904',
    name: 'carport'
}

export const PATH_STRINGS = {
    mainPage: '/',
    buildingConsumption: '/buildingConsumption'
}

export const EMPTY_DATA_SET: DataSet = {
    id: '',
    date: new Date(),
    kilometer: 0,
    power: 0,
    name: '',
    loadingStation: DEFAULT_LOADING_STATION
}

export let DEFAULT_CAR: Car = {
    name: 'Zoe'
}

export let DEFAULT_HOUSE: House = {
    name: 'F233',
    flats: []
}

export const EMPTY_USER: User = {}

export const DB_DATA_SET_COLLECTION_KEY: string = 'consumptionData'
export const DB_USER_COLLECTION_KEY: string = 'users'
export const DB_CARS: string = 'cars'
export const DB_HOUSES: string = 'houses'

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

export let houses: House[]

getHouses().then((result) => {
    if (result) {
        houses = result
        DEFAULT_HOUSE = {
            name: cars[0].name,
            flats: houses[0].flats
        }
    }
}).catch((error: Error) => {
    console.log(error.message)
})



