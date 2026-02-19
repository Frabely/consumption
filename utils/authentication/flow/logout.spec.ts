import { describe, expect, it, vi } from "vitest";
import { setCurrentUser } from "@/store/reducer/currentUser";
import { setModalStateNone } from "@/store/reducer/modalState";
import { setAuthStatusUnauthenticated } from "@/store/reducer/authStatus";
import { setDataSetArray } from "@/store/reducer/currentDataSet";
import { setPage } from "@/store/reducer/currentPage";
import { Page } from "@/constants/enums";
import { performAuthLogout } from "@/utils/authentication/flow/logout";

describe("authLogout", () => {
  it("dispatches logout actions and clears session", () => {
    const dispatch = vi.fn();
    const clearSessionFn = vi.fn(() => true);
    const emitTelemetryEvent = vi.fn();

    performAuthLogout({
      dispatch,
      clearSessionFn,
      resetDataSet: true,
      emitTelemetryEvent,
    });

    expect(dispatch).toHaveBeenCalledWith(setCurrentUser({}));
    expect(dispatch).toHaveBeenCalledWith(setModalStateNone());
    expect(dispatch).toHaveBeenCalledWith(setAuthStatusUnauthenticated());
    expect(dispatch).toHaveBeenCalledWith(setDataSetArray([]));
    expect(dispatch).toHaveBeenCalledWith(setPage(Page.Home));
    expect(clearSessionFn).toHaveBeenCalledTimes(1);
    expect(emitTelemetryEvent).toHaveBeenCalledTimes(1);
  });

  it("does not reset dataset when not requested", () => {
    const dispatch = vi.fn();
    const clearSessionFn = vi.fn(() => true);
    const emitTelemetryEvent = vi.fn();

    performAuthLogout({
      dispatch,
      clearSessionFn,
      resetDataSet: false,
      emitTelemetryEvent,
    });

    expect(dispatch).not.toHaveBeenCalledWith(setDataSetArray([]));
    expect(dispatch).toHaveBeenCalledWith(setPage(Page.Home));
    expect(emitTelemetryEvent).toHaveBeenCalledTimes(1);
  });
});



