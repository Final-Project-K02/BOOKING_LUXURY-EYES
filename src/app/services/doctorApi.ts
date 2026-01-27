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
  tagTypes: ["Doctors"], // khai báo danh sách các tag sẽ dùng
  endpoints: (builder) => ({
    // builder là object chứa các hàm để tạo endpoint
    getDoctors: builder.query<DoctorResponse, { inputSearch?: string } | void>({
      query: (params) =>
        params?.inputSearch
          ? `doctors/?name=${params.inputSearch}`
          : `doctors/`,
      providesTags: ["Doctors"],
    }),
  }),
});

export const { useGetDoctorsQuery } = doctorApi;
