import { createApi } from "@reduxjs/toolkit/query/react";
import type { DoctorResponse } from "../../types/Doctor";
import { createBaseQuery } from "./baseQuery";

export const doctorApi = createApi({
  reducerPath: "doctorApi",
  baseQuery: createBaseQuery("http://localhost:8888/api/"),
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
