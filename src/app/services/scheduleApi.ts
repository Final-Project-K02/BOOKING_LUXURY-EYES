import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ScheduleResponse } from "../../types/Schedule";
import type { RootState } from "../store";

export const scheduleApi = createApi({
  reducerPath: "scheduleApi",
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
  tagTypes: ["Schedules", "ScheduleId"],
  endpoints: (builder) => ({
    getSchedules: builder.query<ScheduleResponse, void>({
      query: () => `schedules`,
      providesTags: ["Schedules"],
    }),

    getScheduleDoctorId: builder.query<ScheduleResponse, string>({
      query: (doctorId) => `schedules?doctorId=${doctorId}`,
      providesTags: ["ScheduleId"],
    }),
  }),
});

export const { useGetScheduleDoctorIdQuery, useGetSchedulesQuery } =
  scheduleApi;
