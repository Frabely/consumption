import {describe, expect, it} from "vitest";
import authStatusSlice, {
    setAuthStatus,
    setAuthStatusAuthenticated,
    setAuthStatusUnauthenticated,
    setAuthStatusUnknown
} from "@/store/reducer/authStatus";
import {AUTH_STATUS} from "@/utils/authentication/core/targetState";

describe("authStatus slice", () => {
    it("uses unknown as initial state", () => {
        const initial = authStatusSlice.reducer(undefined, {type: "unknown"});
        expect(initial).toBe(AUTH_STATUS.UNKNOWN);
    });

    it("sets explicit auth status", () => {
        const state = authStatusSlice.reducer(AUTH_STATUS.UNKNOWN, setAuthStatus(AUTH_STATUS.AUTHENTICATED));
        expect(state).toBe(AUTH_STATUS.AUTHENTICATED);
    });

    it("sets unknown/authenticated/unauthenticated shortcuts", () => {
        const authenticated = authStatusSlice.reducer(AUTH_STATUS.UNKNOWN, setAuthStatusAuthenticated());
        const unauthenticated = authStatusSlice.reducer(authenticated, setAuthStatusUnauthenticated());
        const unknown = authStatusSlice.reducer(unauthenticated, setAuthStatusUnknown());

        expect(authenticated).toBe(AUTH_STATUS.AUTHENTICATED);
        expect(unauthenticated).toBe(AUTH_STATUS.UNAUTHENTICATED);
        expect(unknown).toBe(AUTH_STATUS.UNKNOWN);
    });
});




