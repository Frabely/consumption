import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {DEFAULT_LOADING_STATION} from "@/constants/constantData";
import {LoadingStation} from "@/constants/types";

const LoadingStationSlice = createSlice({
    name: 'loadingStation',
    initialState: DEFAULT_LOADING_STATION,
    reducers: {
        setLoadingStation: (_state, action: PayloadAction<LoadingStation>) => {
            return action.payload
        },
    },
})



export const { setLoadingStation } = LoadingStationSlice.actions

export default LoadingStationSlice;
