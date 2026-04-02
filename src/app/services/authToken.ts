import { API_BASE_URL } from "../../config";

const REFRESH_ENDPOINT = "auth/refresh-token";

let refreshPromise: Promise<string | null> | null = null;

const parseTokenFromResponse = (payload: unknown): string | null => {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const typedPayload = payload as {
    accessToken?: unknown;
    data?: unknown;
  };

  if (
    typeof typedPayload.accessToken === "string" &&
    typedPayload.accessToken.trim()
  ) {
    return typedPayload.accessToken;
  }

  if (typeof typedPayload.data === "string" && typedPayload.data.trim()) {
    return typedPayload.data;
  }

  if (typedPayload.data && typeof typedPayload.data === "object") {
    const nestedData = typedPayload.data as { accessToken?: unknown };
    if (
      typeof nestedData.accessToken === "string" &&
      nestedData.accessToken.trim()
    ) {
      return nestedData.accessToken;
    }
  }

  return null;
};

const requestRefresh = async (): Promise<string | null> => {
  const endpoint = `${API_BASE_URL}${REFRESH_ENDPOINT}`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as unknown;
    const newToken = parseTokenFromResponse(data);

    if (newToken) {
      return newToken;
    }
  } catch {
    return null;
  }

  return null;
};

export const getStoredAccessToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

export const setStoredAccessToken = (token: string): void => {
  localStorage.setItem("accessToken", token);
};

export const clearStoredAuth = (): void => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
};

export const getStoredUser = <T>(): T | null => {
  const rawUser = localStorage.getItem("user");

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as T;
  } catch {
    return null;
  }
};

export const refreshAccessToken = async (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = requestRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};
