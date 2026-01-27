import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  Appointment,
  BookingPayload,
  BookingResponse,
} from "../../types/Booking";
import type { RootState } from "../store";

export const appointmentApi = createApi({
  reducerPath: "appointmentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://api-class-o1lo.onrender.com/api/luxury_eyes/",
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
  tagTypes: ["Appointments", "AppointmentScheduleId", "ScheduleId"],
  endpoints: (builder) => ({
    getAppointments: builder.query<BookingResponse, string>({
      query: (userId) => `appointments/?userId=${userId}`,
      providesTags: ["Appointments"],
    }),

    getBookingByScheduleId: builder.query<BookingResponse, string>({
      query: (scheduleId) => `appointments?scheduleId=${scheduleId}`,
      providesTags: (_result, _error, scheduleId) => [
        { type: "AppointmentScheduleId", id: scheduleId },
      ],
    }),
    createBooking: builder.mutation<void, BookingPayload>({
      query: (bookingData) => ({
        url: "/appointments",
        method: "POST",
        body: bookingData,
      }),
      invalidatesTags: (_result, _error, arg) => [
        "Appointments",
        { type: "AppointmentScheduleId", id: arg.scheduleId },
        { type: "ScheduleId", id: arg.doctor.id },
      ],
    }),

    cancelAppointment: builder.mutation<
      Appointment,
      { id: string; reason: string; scheduleId: string }
    >({
      query: ({ id, reason }) => ({
        url: `appointments/${id}`,
        method: "PATCH",
        body: { status: "CANCELED", reason },
      }),
      invalidatesTags: (_r, _e, arg) => [
        "Appointments",
        { type: "AppointmentScheduleId", id: arg.scheduleId },
      ],
    }),

    cancelAppointmentConfirm: builder.mutation<
      Appointment,
      { id: string; reason: string; scheduleId: string }
    >({
      query: ({ id, reason }) => ({
        url: `appointments/${id}`,
        method: "PATCH",
        body: { status: "REQUEST-CANCELED", reason },
      }),
      invalidatesTags: (_r, _e, arg) => [
        "Appointments",
        { type: "AppointmentScheduleId", id: arg.scheduleId },
      ],
    }),
  }),
});

export const {
  useGetAppointmentsQuery,
  useGetBookingByScheduleIdQuery,
  useCreateBookingMutation,
  useCancelAppointmentMutation,
  useCancelAppointmentConfirmMutation,
} = appointmentApi;
