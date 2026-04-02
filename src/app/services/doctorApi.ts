import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  Doctor,
  DoctorFilter,
  DoctorFormValues,
  DoctorResponse,
} from "../../types/Doctor";
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

        if (params?.inputSearch)
          searchParams.set("keyword", params.inputSearch);
        if (params?.scheduleDateFrom)
          searchParams.set("scheduleDateFrom", params.scheduleDateFrom);
        if (params?.scheduleDateTo)
          searchParams.set("scheduleDateTo", params.scheduleDateTo);
        if (typeof params?.page === "number")
          searchParams.set("page", String(params.page));
        if (typeof params?.limit === "number")
          searchParams.set("limit", String(params.limit));

        const queryString = searchParams.toString();
        return queryString ? `doctors?${queryString}` : "doctors";
      },
      providesTags: ["Doctors"],
    }),

    getDoctorsByAdmin: builder.query<DoctorResponse, DoctorFilter | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();

        if (params?.keyword) searchParams.set("keyword", params.keyword);
        if (typeof params?.minPrice === "number")
          searchParams.set("minPrice", String(params.minPrice));
        if (typeof params?.maxPrice === "number")
          searchParams.set("maxPrice", String(params.maxPrice));
        if (typeof params?.experience_year === "number")
          searchParams.set("experience_year", String(params.experience_year));

        const queryString = searchParams.toString();
        return queryString ? `doctors/admin?${queryString}` : "doctors/admin";
      },
      providesTags: ["Doctors"],
    }),

    createDoctor: builder.mutation<
      { message: string; data: Doctor },
      DoctorFormValues
    >({
      query: (body) => ({ url: "/doctors", method: "POST", body }),
      invalidatesTags: ["Doctors"],
    }),

    updateDoctor: builder.mutation<
      { message: string; data: Doctor },
      { id: string } & DoctorFormValues
    >({
      query: ({ id, ...body }) => ({
        url: `/doctors/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Doctors"],
    }),

    deleteDoctor: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/doctors/${id}`, method: "DELETE" }),
      invalidatesTags: ["Doctors"],
    }),

    toggleDoctorStatus: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/doctors/${id}/status`, method: "PATCH" }),
      invalidatesTags: ["Doctors"],
    }),

    updateDoctorAvatar: builder.mutation<
      { message: string; data: Doctor },
      { id: string; avatar: string }
    >({
      query: ({ id, avatar }) => ({
        url: `/doctors/${id}/avatar`,
        method: "PATCH",
        body: { avatar },
      }),
      invalidatesTags: ["Doctors"],
    }),
  }),
});

export const {
  useGetDoctorsQuery,
  useLazyGetDoctorsQuery,
  useGetDoctorsByAdminQuery,
  useLazyGetDoctorsByAdminQuery,
  useCreateDoctorMutation,
  useUpdateDoctorMutation,
  useDeleteDoctorMutation,
  useToggleDoctorStatusMutation,
  useUpdateDoctorAvatarMutation,
} = doctorApi;
