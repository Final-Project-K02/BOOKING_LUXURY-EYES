import { createApi } from "@reduxjs/toolkit/query/react";
import type { DoctorResponse } from "../../types/Doctor";
import { createBaseQuery } from "./baseQuery";

export const doctorApi = createApi({
  reducerPath: "doctorApi",
  baseQuery: createBaseQuery(),
  tagTypes: ["Doctors"], // khai báo danh sách các tag sẽ dùng
  endpoints: (builder) => ({
    /* ================= CLIENT ================= */
    getDoctors: builder.query<DoctorResponse, { inputSearch?: string } | void>({
      query: (params) =>
        params?.inputSearch ? `doctors?name=${params.inputSearch}` : `doctors`,
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
