import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {DataSet} from "@/constants/types";


const initialState: boolean = false;

const isChangingDataSlice = createSlice({
    name: 'isChangingData',
    initialState: initialState,
    reducers: {
        setIsChangingData: (state, action: PayloadAction<boolean>) => {
            return action.payload
        },
    },
})
export const { setIsChangingData } = isChangingDataSlice.actions

export default isChangingDataSlice;
