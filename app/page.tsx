"use client";

import styles from "../styles/page.module.css";
import img from "@/public/bg_vert.jpg";
import Image from "next/image";
import { setDimension } from "@/store/reducer/dimension";
import { useEffect } from "react";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import Home from "@/components/features/home/pages/Home";
import { Page } from "@/constants/enums";
import BuildingConsumption from "@/components/features/building/pages/BuildingConsumption";
import {
  selectAuthStatus,
  selectCurrentPage,
  selectCurrentUser,
} from "@/store/selectors";
import { restoreAuthOnAppStart } from "@/domain/authStartup";
import Loading from "@/components/features/home/Loading";
import { shouldRenderAuthBootLoader } from "@/domain/authBootGuard";
import { AUTH_STATUS } from "@/domain/authTargetState";
import { validateAndApplyActiveSession } from "@/domain/authSessionValidation";
import { startSessionExpiryWatcher } from "@/domain/authSessionExpiry";
import { performAuthLogout } from "@/domain/authLogout";
import { resolveGuardedPage } from "@/domain/authPageGuard";
import { setPage } from "@/store/reducer/currentPage";

/**
 * Bootstraps auth/session state and renders the correct top-level application page.
 * @returns Rendered application root element.
 */
export default function App() {
  const currentPage = useAppSelector(selectCurrentPage);
  const authStatus = useAppSelector(selectAuthStatus);
  const currentUser = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const dimension = useWindowDimensions();

  useEffect(() => {
    dispatch(setDimension(dimension));
  }, [dimension, dispatch]);

  useEffect(() => {
    restoreAuthOnAppStart({ dispatch });
  }, [dispatch]);

  useEffect(() => {
    if (authStatus !== AUTH_STATUS.AUTHENTICATED || !currentUser.key) {
      return;
    }
    void validateAndApplyActiveSession({ userId: currentUser.key, dispatch });
  }, [authStatus, currentUser.key, dispatch]);

  useEffect(() => {
    if (authStatus !== AUTH_STATUS.AUTHENTICATED) {
      return;
    }

    return startSessionExpiryWatcher({
      onExpire: () => performAuthLogout({ dispatch, resetDataSet: true }),
    });
  }, [authStatus, dispatch]);

  const guardedPage = resolveGuardedPage({
    authStatus,
    requestedPage: currentPage,
    userKey: currentUser.key,
    userRole: currentUser.role,
  });

  useEffect(() => {
    if (guardedPage !== currentPage) {
      dispatch(setPage(guardedPage));
    }
  }, [currentPage, dispatch, guardedPage]);

  const showAuthBootLoader = shouldRenderAuthBootLoader(authStatus);

  return (
    <div className={styles.mainContainer}>
      <Image className={styles.image} src={img} alt={""} />
      <div className={styles.imageFilter} />
      {showAuthBootLoader ? (
        <Loading />
      ) : guardedPage === Page.Home ? (
        <Home />
      ) : (
        <BuildingConsumption />
      )}
    </div>
  );
}
