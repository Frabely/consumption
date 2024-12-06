import {createSlice, PayloadAction} from "@reduxjs/toolkit";


const initialState: boolean = false;

const isChangingDataSlice = createSlice({
    name: 'isChangingData',
    initialState: initialState,
    reducers: {
        setIsChangingData: (_state, action: PayloadAction<boolean>) => {
            return action.payload
        },
    },
})
export const { setIsChangingData } = isChangingDataSlice.actions

export default isChangingDataSlice;
