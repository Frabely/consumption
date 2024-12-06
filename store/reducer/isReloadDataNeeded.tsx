import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {ReloadNeeded} from "@/constants/types";

const initialState: ReloadNeeded = {
    isReloadCarsNeeded: true,
    isReloadHousesNeeded: true,
    isReloadFieldsNeeded: true,
    isReloadDataSetNeeded: true,
    isReloadLoadingStationsNeeded: true
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
        setIsReloadDataSetNeeded: (state, action: PayloadAction<boolean>) => {
            return {...state, isReloadDataSetNeeded: action.payload}
        },
        setIsReloadLoadingStationsNeeded: (state, action: PayloadAction<boolean>) => {
            return {...state, isReloadLoadingStationsNeeded: action.payload}
        },
        setIsReloadNeeded: (_state, action: PayloadAction<ReloadNeeded>) => {
            return action.payload
        }
    },
})
export const {
    setIsReloadCarsNeeded,
    setIsReloadHousesNeeded,
    setIsReloadFieldsNeeded,
    setIsReloadDataSetNeeded,
    setIsReloadLoadingStationsNeeded,
    setIsReloadNeeded } = isReloadDataNeededSlice.actions

export default isReloadDataNeededSlice;
