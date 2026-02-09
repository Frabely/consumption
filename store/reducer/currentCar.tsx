import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Car} from "@/constants/types";
import {DEFAULT_CAR_NAME} from "@/constants/constantData";



const CurrentCarSlice = createSlice({
    name: 'currentCar',
    initialState: {name: DEFAULT_CAR_NAME} as Car,
    reducers: {
        setCurrentCar: (state, action: PayloadAction<Car>) => {
            return action.payload
        },
        updateCarKilometers: (state, action: PayloadAction<number>) => {

            return {...state, kilometer: action.payload}
        },
        updateCarPrevKilometers: (state, action: PayloadAction<number>) => {
            return {...state, prevKilometer: action.payload}
        },
    },
})
export const {updateCarKilometers, setCurrentCar, updateCarPrevKilometers} = CurrentCarSlice.actions

export default CurrentCarSlice;
