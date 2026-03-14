import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import { API_BASE_URL } from "../../config";
import {
  clearStoredAuth,
  getStoredAccessToken,
  getStoredUser,
  refreshAccessToken,
  setStoredAccessToken,
} from "../../api/authToken";
import { logout, setAuth } from "../features/authSlice";
import type { User } from "../../types/User";

let isHandlingAccountLocked = false;

export const createBaseQuery = (): BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> => {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token =
        getStoredAccessToken() || (getState() as RootState).auth.accessToken;

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
  });

  return async (args, api, extraOptions) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    if (
      result.error?.status === 403 &&
      result.error?.data &&
      typeof result.error.data === "object" &&
      (result.error.data as { err?: unknown }).err === "ACCOUNT_LOCKED"
    ) {
      if (!isHandlingAccountLocked) {
        isHandlingAccountLocked = true;
        sessionStorage.setItem("accountLockedNotice", "1");
        clearStoredAuth();
        api.dispatch(logout());

        if (typeof window !== "undefined" && window.location.pathname !== "/") {
          window.location.replace("/");
        }

        setTimeout(() => {
          isHandlingAccountLocked = false;
        }, 0);
      }

      return result;
    }

    if (result.error?.status === 401) {
      const newToken = await refreshAccessToken();

      if (newToken) {
        const stateUser = (api.getState() as RootState).auth.user;
        const user = stateUser || getStoredUser<User>();

        if (user) {
          setStoredAccessToken(newToken);
          api.dispatch(setAuth({ user, accessToken: newToken }));
          result = await rawBaseQuery(args, api, extraOptions);
        } else {
          clearStoredAuth();
          api.dispatch(logout());
        }
      } else {
        clearStoredAuth();
        api.dispatch(logout());
      }
    }

    return result;
  };
};
