import {configureStore, ThunkAction, Action} from "@reduxjs/toolkit";
import isAddingDataModalActiveSlice from "@/store/reducer/isAddingDataModalActive";
import currentDataSet from "@/store/reducer/currentDataSet";
import KilometerSlice from "@/store/reducer/modal/kilometer";
import PowerSlice from "@/store/reducer/modal/power";
import TimeSlice from "@/store/reducer/modal/time";
import DateSlice from "@/store/reducer/modal/date";
import isChangingDataSlice from "@/store/reducer/isChangingData";

export const store = configureStore({
    reducer: {
        [isAddingDataModalActiveSlice.name]: isAddingDataModalActiveSlice.reducer,
        [currentDataSet.name]: currentDataSet.reducer,
        [KilometerSlice.name]: KilometerSlice.reducer,
        [PowerSlice.name]: PowerSlice.reducer,
        [TimeSlice.name]: TimeSlice.reducer,
        [DateSlice.name]: DateSlice.reducer,
        [isChangingDataSlice.name]: isChangingDataSlice.reducer
    },
    devTools: true
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// // Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
