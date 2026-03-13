import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  clearStoredAuth,
  getStoredAccessToken,
  getStoredUser,
  refreshAccessToken,
  setStoredAccessToken,
} from "./authToken";
import { store, type RootState } from "../app/store";
import { logout, setAuth } from "../app/features/authSlice";
import type { User } from "../types/User";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getStoredAccessToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config as
      | (typeof error.config & { _retry?: boolean })
      | undefined;
    const requestUrl = String(originalRequest?.url || "");
    const shouldSkipRefresh =
      requestUrl.includes("/auth/logout") ||
      requestUrl.includes("/auth/refresh-token");

    if (
      error?.response?.status === 401 &&
      originalRequest &&
      !shouldSkipRefresh &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const newToken = await refreshAccessToken();
      if (newToken) {
        const currentUser = (store.getState() as RootState).auth.user;
        const user = currentUser || getStoredUser<User>();

        if (user) {
          setStoredAccessToken(newToken);
          store.dispatch(setAuth({ user, accessToken: newToken }));
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      }

      clearStoredAuth();
      store.dispatch(logout());
    }

    return Promise.reject(error);
  },
);

export default api;
