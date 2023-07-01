import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Car} from "@/constants/types";
import {DEFAULT_CAR} from "@/constants/constantData";

const CurrentCarSlice = createSlice({
    name: 'currentCar',
    initialState: DEFAULT_CAR,
    reducers: {
        setCurrentCar: (state, action: PayloadAction<Car>) => {
            return action.payload
        },
        updateKilometers: (state, action: PayloadAction<number>) => {
            const newPrev = state.kilometer
            return {...state, prevKilometer: newPrev, kilometer: action.payload}
        },
    },
})
export const {setCurrentCar} = CurrentCarSlice.actions

export default CurrentCarSlice;
