import type { AppointmentStatus } from "../pages/client/AppointmentHistoryPage";

export interface BookingPayload {
  userId: string;
  scheduleId: string;
  scheduleSlotId: number;
  dateTime: string;
  time: string;
  blockTime: number;
  location: string;
  status: AppointmentStatus;
  appointmentMethod: string;
  symptoms: string;
  payment: {
    totalAmount: number;
    paymentMethod: string;
    paymentStatus: string;
  };
  
  doctor: {
    id: string;
    name: string;
    avatar?: string;
    experience_year: number;
  };
  room: {
    id: number;
    name: string;
  };
  patient: {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
  };
}

export interface Appointment extends BookingPayload {
  _id?: string;
  reason?: string;
  updatedAt?: string;
}
export interface BookingResponse {
  success: boolean;
  data: BookingPayload[];
}

export const BLOCK_STATUSES = [
  "PENDING",
  "CONFIRM",
  "CHECKIN",
  "DONE",
  "REQUEST-CANCELED",
];
