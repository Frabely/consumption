import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {ReloadNeeded} from "@/constants/types";

const initialState: ReloadNeeded = {
    isReloadCarsNeeded: false,
    isReloadHousesNeeded: false,
    isReloadFieldsNeeded: false
}

const isReloadDataNeededSlice = createSlice({
    name: 'isReloadDataNeeded',
    initialState: initialState,
    reducers: {
        setIsReloadCarsNeeded: (state, action: PayloadAction<boolean>) => {
            return {...state, isReloadCarsNeeded: action.payload}
        },
        setIsReloadHousesNeeded: (state, action: PayloadAction<boolean>) => {
            return {...state, isReloadHousesNeeded: action.payload}
        },
        setIsReloadFieldsNeeded: (state, action: PayloadAction<boolean>) => {
            return {...state, isReloadFieldsNeeded: action.payload}
        },
        setIsReloadNeeded: (_state, action: PayloadAction<ReloadNeeded>) => {
            return action.payload
        }
    },
})
export const { setIsReloadCarsNeeded, setIsReloadHousesNeeded, setIsReloadFieldsNeeded, setIsReloadNeeded } = isReloadDataNeededSlice.actions

export default isReloadDataNeededSlice;
