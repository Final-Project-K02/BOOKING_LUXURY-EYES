import { createApi } from "@reduxjs/toolkit/query/react";
import type { DoctorSchedule, ScheduleResponse } from "../../types/Schedule";
import type { AdminTimeSlot } from "../../types/ScheduleManagement";
import { createBaseQuery } from "./baseQuery";

type SchedulePayload = {
  doctorId: string;
  roomId: number;
  roomName: string;
  price: number;
  timeSlots: AdminTimeSlot[];
};

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

    createSchedule: builder.mutation<
      { message: string; data: DoctorSchedule },
      SchedulePayload
    >({
      query: (body) => ({ url: "schedules", method: "POST", body }),
      invalidatesTags: ["Schedules"],
    }),

    updateSchedule: builder.mutation<
      { message: string; data: DoctorSchedule },
      { id: string } & SchedulePayload
    >({
      query: ({ id, ...body }) => ({
        url: `schedules/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Schedules"],
    }),

    deleteSchedule: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `schedules/${id}`, method: "DELETE" }),
      invalidatesTags: ["Schedules", "ScheduleId"],
    }),
  }),
});

export const {
  useGetScheduleDoctorIdQuery,
  useGetSchedulesQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
} = scheduleApi;
