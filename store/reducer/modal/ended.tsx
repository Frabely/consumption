import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const EndedSlice = createSlice({
    name: "ended",
    initialState: null as Date | null,
    reducers: {
        setEnded: (_state, action: PayloadAction<Date | null | undefined>) => {
            return action.payload ?? null
        },
    },
})

export const {setEnded} = EndedSlice.actions

export default EndedSlice
