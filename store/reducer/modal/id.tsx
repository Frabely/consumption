import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState: string = ''

const IdSlice = createSlice({
    name: 'id',
    initialState: initialState,
    reducers: {
        setId: (state, action: PayloadAction<string>) => {
            return action.payload
        },
    },
})


export const {setId} = IdSlice.actions

export default IdSlice;
