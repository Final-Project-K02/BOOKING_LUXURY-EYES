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
    paymentStatus:
      | "UNPAID"
      | "PENDING"
      | "PAID"
      | "FAILED"
      | "EXPIRED"
      | string;
    depositRate?: number;
    depositAmount?: number;
    txnRef?: string | null;
    vnpTransactionNo?: string | null;
    paidAt?: string | null;
    expireAt?: string | null;
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
  _id: string;
  reason?: string;
  updatedAt?: string;
  createdAt?: string;

  // backend hiện tại có thể trả populate theo kiểu khác
  doctor:
    | BookingPayload["doctor"]
    | {
        _id?: string;
        id?: string;
        name?: string;
        fullName?: string;
        avatar?: string;
        experience_year?: number;
      };

  patient:
    | BookingPayload["patient"]
    | {
        _id?: string;
        fullName?: string;
        phone?: string;
        dateOfBirth?: string;
        gender?: string;
      };

  room: {
    id?: number;
    name?: string;
  };
}

export interface BookingResponse {
  success?: boolean;
  message?: string;
  data: Appointment[];
}

export const BLOCK_STATUSES = [
  "PENDING",
  "CONFIRM",
  "CHECKIN",
  "DONE",
  "REQUEST-CANCELED",
];