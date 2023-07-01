import {DataSet, LoadingStation, User} from "@/constants/types";
import {getLoadingStations} from "@/firebase/functions";

export const EMPTY_DATA_SET: DataSet = {
    id: '',
    date: '',
    time: '',
    kilometer: 0,
    power: 0,
    name: ''
}

export const EMPTY_USER: User = {
}

export const DB_DATA_SET_COLLECTION_KEY: string = 'consumptionData'
export const DB_USER_COLLECTION_KEY: string = 'users'

export const DB_LOADING_STATIONS: string = 'loadingStations'
export const DEFAULT_LOADING_STATION: LoadingStation = {
    id: '17498904',
    name: 'carport'
}

export let loadingStations: LoadingStation[]
getLoadingStations().then((result) => {
    if (result) {
        loadingStations = result
    }
})

