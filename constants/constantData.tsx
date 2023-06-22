import {DataSet, User} from "@/constants/types";

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

export const DB_DATA_SET_COLLECTION_KEY = 'consumptionData'
export const DB_USER_COLLECTION_KEY = 'users'
