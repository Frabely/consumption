import {configureStore, ThunkAction, Action} from "@reduxjs/toolkit";
import isAddingDataModalActiveSlice from "@/store/reducer/isAddingDataModalActive";

export const store = configureStore({
    reducer: {
        [isAddingDataModalActiveSlice.name]: isAddingDataModalActiveSlice.reducer
    },
    devTools: true
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// // Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
