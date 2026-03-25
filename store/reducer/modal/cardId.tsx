import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const CardIdSlice = createSlice({
    name: "cardId",
    initialState: null as string | null,
    reducers: {
        setCardId: (_state, action: PayloadAction<string | null | undefined>) => {
            return action.payload ?? null
        },
    },
})

export const {setCardId} = CardIdSlice.actions

export default CardIdSlice
