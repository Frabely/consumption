import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {DataSet} from "@/constants/types";


const initialState: boolean = true;

const isChangingDataSlice = createSlice({
    name: 'isChangingData',
    initialState: initialState,
    reducers: {
        invertIsChangingData: (state) => {
            return !state
        },
        setIsChangingData: (state, action: PayloadAction<boolean>) => {
            return !state
        },
    },
})
export const { invertIsChangingData, setIsChangingData } = isChangingDataSlice.actions

export default isChangingDataSlice;
