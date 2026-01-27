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
    baseUrl: "http://localhost:8888/api",
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
    // 🔹 Lấy lịch hẹn của user
    getAppointments: builder.query<BookingResponse, string>({
      query: (userId) => `appointments?userId=${userId}`,
      providesTags: ["Appointments"],
    }),

    // 🔹 Lấy lịch theo schedule
    getBookingByScheduleId: builder.query<BookingResponse, string>({
      query: (scheduleId) => `appointments?scheduleId=${scheduleId}`,
      providesTags: (_r, _e, scheduleId) => [
        { type: "AppointmentScheduleId", id: scheduleId },
      ],
    }),

    // 🔹 Lấy lịch theo bác sĩ ✅ (MỚI)
    getAppointmentsByDoctor: builder.query<BookingResponse, string>({
      query: (doctorId) => `appointments/doctor?doctorId=${doctorId}`,
      providesTags: (_r, _e, doctorId) => [
        { type: "ScheduleId", id: doctorId },
      ],
    }),

    // 🔹 Đặt lịch
   createBooking: builder.mutation<void, BookingPayload>({
  query: (bookingData) => ({
    url: "/appointments",
    method: "POST",
    body: bookingData,
  }),
  invalidatesTags: (_r, _e, arg) => [
    "Appointments",
    { type: "AppointmentScheduleId", id: arg.scheduleId },
    { type: "ScheduleId", id: arg.doctor.id },
  ],
}),


    // 🔹 Huỷ lịch (người dùng)
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

    // 🔹 Gửi yêu cầu huỷ (xác nhận)
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
  useGetAppointmentsByDoctorQuery,
  useCreateBookingMutation,
  useCancelAppointmentMutation,
  useCancelAppointmentConfirmMutation,
} = appointmentApi;
