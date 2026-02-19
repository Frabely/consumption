import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AUTH_STATUS, AuthStatus} from "@/utils/authentication/core/targetState";

const authStatusSlice = createSlice({
    name: "authStatus",
    initialState: AUTH_STATUS.UNKNOWN as AuthStatus,
    reducers: {
        setAuthStatus: (_state, action: PayloadAction<AuthStatus>) => action.payload,
        setAuthStatusUnknown: () => AUTH_STATUS.UNKNOWN,
        setAuthStatusAuthenticated: () => AUTH_STATUS.AUTHENTICATED,
        setAuthStatusUnauthenticated: () => AUTH_STATUS.UNAUTHENTICATED
    }
});

export const {
    setAuthStatus,
    setAuthStatusUnknown,
    setAuthStatusAuthenticated,
    setAuthStatusUnauthenticated
} = authStatusSlice.actions;

export default authStatusSlice;




