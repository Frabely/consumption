import {Car, House, LoadingStation, Room, User} from "@/constants/types";
import {getCars, getHouses, getLoadingStations} from "@/firebase/functions";

export const DEFAULT_LOADING_STATION: LoadingStation = {
    id: '17498904',
    name: 'carport'
}

export const PATH_STRINGS = {
    mainPage: '/',
    buildingConsumption: '/buildingConsumption'
}

export let DEFAULT_CAR: Car = {
    name: 'Zoe'
}

export let DEFAULT_HOUSE: House = {
    name: 'F233',
    flats: []
}

export let EMPTY_ROOM: Room = {
    name: '-',
    fields: {}
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

export const loadAllData = async () => {
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
            DEFAULT_CAR = {
                name: cars[0].name,
                kilometer: cars[0].kilometer,
                prevKilometer: cars[0].prevKilometer,
            }
        }
    }
    const resultHouses = await getHouses()
        .catch((error: Error) => {
        console.log(error.message)
    })
    if (resultHouses) {
        houses = resultHouses
        if (houses.length > 0) {
            DEFAULT_HOUSE = {
                name: houses[0].name,
                flats: houses[0].flats
            }
        }
    }
}



