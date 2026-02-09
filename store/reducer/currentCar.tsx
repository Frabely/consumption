import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Car} from "@/constants/types";
import {CarNames} from "@/constants/enums";



const CurrentCarSlice = createSlice({
    name: 'currentCar',
    initialState: {name: CarNames.Zoe} as Car,
    reducers: {
        setCurrentCar: (_, action: PayloadAction<Car>) => {
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
