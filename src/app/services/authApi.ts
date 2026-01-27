import type { AxiosError } from "axios";
import api from "../../api";
import type { LoginPayload } from "../../types/User";
import type { ForgotPasswordPayload } from "../../types/Auth";
import type { ApiErrorResponse } from "../../types/ApiResponse";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]+$/;

export const authService = {
  register: async (payload: {
    fullName: string;
    email: string;
    password: string;
  }) => {
    return api.post("/auth/register", payload);
  },

  login: async (payload: LoginPayload) => {
    return api.post("/auth/login", payload);
  },

  forgotPassword: async (payload: ForgotPasswordPayload) => {
    return api.post("/auth/send-forgot", payload);
  },

  resetPassword: async (payload: { token: string; password: string }) => {
    return api.post("/auth/forgot-password", payload);
  },
};

export const handleAuthError = (error: unknown): string => {
  const err = error as AxiosError<ApiErrorResponse>;
  return err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại";
};

export { PASSWORD_REGEX };
