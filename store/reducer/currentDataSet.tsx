import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {DataSet} from "@/constants/types";

const initialState: DataSet[] = []

const CurrentDataSetSlice = createSlice({
    name: 'currentDataSet',
    initialState: initialState,
    reducers: {
        setDataSetArray: (state, action: PayloadAction<DataSet[]>) => {
            return action.payload
        },
    },
})
export const {
    setDataSetArray} = CurrentDataSetSlice.actions

export default CurrentDataSetSlice;
