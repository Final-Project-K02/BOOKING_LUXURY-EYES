import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { DoctorResponse } from "../../types/Doctor";
import type { RootState } from "../store";

export const doctorApi = createApi({
  reducerPath: "doctorApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8888/api/",
    prepareHeaders: (headers, { getState }) => {
      const token =
        (getState() as RootState).auth.accessToken ||
        localStorage.getItem("accessToken");

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Doctors"],
  endpoints: (builder) => ({
    /* ================= CLIENT ================= */
    getDoctors: builder.query<DoctorResponse, { inputSearch?: string } | void>({
      query: (params) =>
        params?.inputSearch
          ? `doctors?name=${params.inputSearch}`
          : `doctors`,
      providesTags: ["Doctors"],
    }),

    /* ================= ADMIN ================= */
    getDoctorsByAdmin: builder.query<
      DoctorResponse,
      { inputSearch?: string } | void
    >({
      query: (params) =>
        params?.inputSearch
          ? `doctors/admin?name=${params.inputSearch}`
          : `doctors/admin`,
      providesTags: ["Doctors"],
    }),
  }),
});


export const { useGetDoctorsQuery, useGetDoctorsByAdminQuery } = doctorApi;