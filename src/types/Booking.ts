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
      | "REFUND_PENDING"
      | "NO_REFUND"
      | "FAILED"
      | "EXPIRED"
      | "REFUNDED"
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

  patient?: {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
  };
  patientProfileId?: string;
}

export interface Appointment extends Omit<
  BookingPayload,
  "doctor" | "patient" | "room"
> {
  _id: string;
  reason?: string;
  canceledBy?: "patient" | "clinic" | "system" | string;
  canceledAt?: string;
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
    | string
    | {
        _id?: string;
        fullName?: string;
        phone?: string;
        dateOfBirth?: string;
        gender?: string;
      };

  patientProfile?: {
    _id?: string;
    fullName?: string;
    phone?: string;
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
