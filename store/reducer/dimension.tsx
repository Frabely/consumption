import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Dimension} from "@/constants/types";

const initialState: Dimension = {height: 0, width: 0, isHorizontal: false};

const dimensionSlice = createSlice({
    name: "dimension",
    initialState,
    reducers: {
        setDimension: (_state, action: PayloadAction<Dimension>) => action.payload
    }
});

export const {setDimension} = dimensionSlice.actions;
export default dimensionSlice;
