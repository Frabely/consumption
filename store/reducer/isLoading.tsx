import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState: boolean = true;

const isLoadingSlice = createSlice({
    name: 'isLoading',
    initialState: initialState,
    reducers: {
        setIsLoading: (_state, action: PayloadAction<boolean>) => {
            return action.payload
        },
    },
})
export const { setIsLoading } = isLoadingSlice.actions

export default isLoadingSlice;
