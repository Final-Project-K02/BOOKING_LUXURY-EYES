import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./baseQuery";
import type { ApiResponse } from "../../types/ApiResponse";

export type UserRole = "USER" | "DOCTOR" | "ADMIN";
export type UserStatus = "ACTIVE" | "BLOCKED";

export interface AdminUser {
  _id: string;
  fullName?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  avatar?: string;
}

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: createBaseQuery(),
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    getUsers: builder.query<ApiResponse<AdminUser[]>, void>({
      query: () => "/users",
      providesTags: ["Users"],
    }),

    updateUserRole: builder.mutation<
      ApiResponse<null>,
      { id: string; role: UserRole }
    >({
      query: ({ id, role }) => ({
        url: `/users/${id}/role`,
        method: "PUT",
        body: { role },
      }),
      invalidatesTags: ["Users"],
    }),

    updateUserStatus: builder.mutation<
      ApiResponse<null>,
      { id: string; status: UserStatus }
    >({
      query: ({ id, status }) => ({
        url: `/users/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
} = userApi;
