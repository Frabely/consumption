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
        addDataSetToDataList: (state, action: PayloadAction<DataSet>) => {
            state.push(action.payload)
            return state
        },
        removeDataSet: (state, action: PayloadAction<DataSet>) => {
            return state.filter((dataset) => JSON.stringify(dataset) !== JSON.stringify(action.payload)
            )
        },
    },
})
export const {addDataSetToDataList, removeDataSet, setDataSetArray} = CurrentDataSetSlice.actions

export default CurrentDataSetSlice;
