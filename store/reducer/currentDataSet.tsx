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
        // addDataSetToDataList: (state, action: PayloadAction<DataSet>) => {
        //     state.unshift(action.payload)
        //     return state
        // },
    },
})
export const {
    // addDataSetToDataList,
    setDataSetArray} = CurrentDataSetSlice.actions

export default CurrentDataSetSlice;
