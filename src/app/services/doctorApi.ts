import { createApi } from "@reduxjs/toolkit/query/react";
import type { DoctorResponse } from "../../types/Doctor";
import { createBaseQuery } from "./baseQuery";

type GetDoctorsParams = {
  inputSearch?: string;
  scheduleDateFrom?: string;
  scheduleDateTo?: string;
  page?: number;
  limit?: number;
};

export const doctorApi = createApi({
  reducerPath: "doctorApi",
  baseQuery: createBaseQuery(),
  tagTypes: ["Doctors"],
  endpoints: (builder) => ({
    getDoctors: builder.query<DoctorResponse, GetDoctorsParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();

        if (params?.inputSearch) {
          searchParams.set("keyword", params.inputSearch);
        }

        if (params?.scheduleDateFrom) {
          searchParams.set("scheduleDateFrom", params.scheduleDateFrom);
        }

        if (params?.scheduleDateTo) {
          searchParams.set("scheduleDateTo", params.scheduleDateTo);
        }

        if (typeof params?.page === "number") {
          searchParams.set("page", String(params.page));
        }

        if (typeof params?.limit === "number") {
          searchParams.set("limit", String(params.limit));
        }

        const queryString = searchParams.toString();
        return queryString ? `doctors?${queryString}` : "doctors";
      },
      providesTags: ["Doctors"],
    }),

    getDoctorsByAdmin: builder.query<
      DoctorResponse,
      GetDoctorsParams | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();

        if (params?.inputSearch) {
          searchParams.set("keyword", params.inputSearch);
        }

        if (params?.scheduleDateFrom) {
          searchParams.set("scheduleDateFrom", params.scheduleDateFrom);
        }

        if (params?.scheduleDateTo) {
          searchParams.set("scheduleDateTo", params.scheduleDateTo);
        }

        if (typeof params?.page === "number") {
          searchParams.set("page", String(params.page));
        }

        if (typeof params?.limit === "number") {
          searchParams.set("limit", String(params.limit));
        }

        const queryString = searchParams.toString();
        return queryString
          ? `doctors/admin?${queryString}`
          : "doctors/admin";
      },
      providesTags: ["Doctors"],
    }),
  }),
});

export const { useGetDoctorsQuery, useGetDoctorsByAdminQuery } = doctorApi;
