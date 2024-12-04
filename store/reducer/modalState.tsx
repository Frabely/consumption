import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {ModalState} from "@/constants/enums";

const modalStateSlice = createSlice({
    name: 'modalState',
    initialState: ModalState.None,
    reducers: {
        setModalState: (state, action: PayloadAction<ModalState>) => {
            return action.payload
        },
        setModalStateNone: () => {
            return ModalState.None
        },
    },
})
export const { setModalState, setModalStateNone } = modalStateSlice.actions

export default modalStateSlice;
