import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./baseQuery";
import type { LoginPayload, User } from "../../types/User";
import type { ForgotPasswordPayload } from "../../types/Auth";
import type { ApiResponse } from "../../types/ApiResponse";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]+$/;

interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    register: builder.mutation<ApiResponse<null>, RegisterPayload>({
      query: (payload) => ({
        url: "/auth/register",
        method: "POST",
        body: payload,
      }),
    }),

    login: builder.mutation<ApiResponse<LoginResponse>, LoginPayload>({
      query: (payload) => ({
        url: "/auth/login",
        method: "POST",
        body: payload,
      }),
    }),

    forgotPassword: builder.mutation<ApiResponse<null>, ForgotPasswordPayload>({
      query: (payload) => ({
        url: "/auth/send-forgot",
        method: "POST",
        body: payload,
      }),
    }),

    resetPassword: builder.mutation<ApiResponse<null>, ResetPasswordPayload>({
      query: (payload) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: payload,
      }),
    }),

    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
} = authApi;

export { PASSWORD_REGEX };
