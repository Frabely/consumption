import {createSlice} from "@reduxjs/toolkit";
import {Dimension} from "@/constants/types";


const initialState: Dimension = {height: 0, width: 0, isHorizontal: false};

const dimensionSlice = createSlice({
    name: 'dimension',
    initialState: initialState,
    reducers: {
        setDimension: (state, action) => {
            return action.payload
        },
    },
})
export const { setDimension} = dimensionSlice.actions

export default dimensionSlice;
