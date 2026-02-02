import { createApi } from "@reduxjs/toolkit/query/react";
import type { ScheduleResponse } from "../../types/Schedule";
import { createBaseQuery } from "./baseQuery";

export const scheduleApi = createApi({
  reducerPath: "scheduleApi",
  baseQuery: createBaseQuery(),
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
