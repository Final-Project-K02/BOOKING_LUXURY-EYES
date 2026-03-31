import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  Appointment,
  BookingPayload,
  BookingResponse,
} from "../../types/Booking";
import { createBaseQuery } from "./baseQuery";

export const appointmentApi = createApi({
  reducerPath: "appointmentApi",
  baseQuery: createBaseQuery(),

  tagTypes: [
    "Appointments",
    "AppointmentScheduleId",
    "ScheduleId",
    "AdminAppointments",
  ],
  endpoints: (builder) => ({
    getAppointments: builder.query<BookingResponse, string>({
      query: (userId) => `appointments?userId=${userId}`,
      providesTags: ["Appointments"],
    }),

    getBookingByScheduleId: builder.query<BookingResponse, string>({
      query: (scheduleId) => `appointments?scheduleId=${scheduleId}`,
      providesTags: (_r, _e, scheduleId) => [
        { type: "AppointmentScheduleId", id: scheduleId },
      ],
    }),

    getAppointmentsByDoctor: builder.query<BookingResponse, string>({
      query: (doctorId) => `appointments/doctor?doctorId=${doctorId}`,
      providesTags: (_r, _e, doctorId) => [
        { type: "ScheduleId", id: doctorId },
      ],
    }),

    getAppointmentDetail: builder.query<{ data: Appointment }, string>({
      query: (id) => `appointments/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Appointments", id }],
    }),

    createBooking: builder.mutation<
      { message: string; data: Appointment },
      BookingPayload
    >({
      query: (bookingData) => ({
        url: "/appointments",
        method: "POST",
        body: {
          doctorId: bookingData.doctor.id,
          scheduleId: bookingData.scheduleId,
          dateTime: bookingData.dateTime,
          time: bookingData.time,
          room: bookingData.room,
          totalAmount: bookingData.payment?.totalAmount || 0,
          location: bookingData.location,
          symptoms: bookingData.symptoms,
          patientProfileId: bookingData.patientProfileId,
          patient: bookingData.patient,
        },
      }),

      invalidatesTags: (_r, _e, arg) => [
        "Appointments",
        "AdminAppointments",
        { type: "AppointmentScheduleId", id: arg.scheduleId },
        { type: "ScheduleId", id: arg.doctor.id },
      ],
    }),

    createVnpayLink: builder.mutation<
      {
        message: string;
        data: {
          appointmentId: string;
          txnRef: string;
          paymentUrl: string;
          expireAt: string;
        };
      },
      string
    >({
      query: (appointmentId) => ({
        url: `/payments/vnpay/link/${appointmentId}`,
        method: "POST",
      }),
      invalidatesTags: ["Appointments"],
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
        body: { status: "CANCELED", reason },
      }),
      invalidatesTags: (_r, _e, arg) => [
        "Appointments",
        { type: "AppointmentScheduleId", id: arg.scheduleId },
      ],
    }),

    getAdminAppointments: builder.query<
      { data: Appointment[] },
      Record<string, string> | void
    >({
      query: (params) => {
        const queryString = params
          ? new URLSearchParams(params).toString()
          : "";
        return queryString ? `appointments?${queryString}` : "appointments";
      },
      providesTags: ["AdminAppointments"],
    }),

    updateAppointment: builder.mutation<
      { message: string; data: Appointment },
      { id: string; status?: string; reason?: string; paymentStatus?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `appointments/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AdminAppointments"],
    }),
  }),
});

export const {
  useGetAppointmentsQuery,
  useGetBookingByScheduleIdQuery,
  useGetAppointmentsByDoctorQuery,
  useLazyGetAppointmentDetailQuery,
  useCreateBookingMutation,
  useCreateVnpayLinkMutation,
  useCancelAppointmentMutation,
  useCancelAppointmentConfirmMutation,
  useGetAdminAppointmentsQuery,
  useLazyGetAdminAppointmentsQuery,
  useUpdateAppointmentMutation,
} = appointmentApi;
