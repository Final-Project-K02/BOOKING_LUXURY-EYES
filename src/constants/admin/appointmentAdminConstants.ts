import type { AppointmentStatus } from "../../types/Booking";

export const STATUS_MAP: Record<
  AppointmentStatus,
  { text: string; color: string }
> = {
  PENDING: { text: "Chờ thanh toán", color: "orange" },
  CONFIRM: { text: "Đã xác nhận", color: "green" },
  CHECKIN: { text: "Đã check-in", color: "blue" },
  DONE: { text: "Hoàn thành", color: "cyan" },
  CANCELED: { text: "Đã huỷ", color: "red" },
  "REQUEST-CANCELED": { text: "Yêu cầu huỷ", color: "volcano" },
};

export const STATUS_FLOW: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING: ["CONFIRM", "CANCELED"],
  CONFIRM: ["CHECKIN", "CANCELED"],
  CHECKIN: ["DONE", "CANCELED"],
  DONE: [],
  CANCELED: [],
  "REQUEST-CANCELED": ["CANCELED"],
};

export const FILTERABLE_STATUSES: AppointmentStatus[] = [
  "PENDING",
  "CONFIRM",
  "CHECKIN",
  "DONE",
  "CANCELED",
];

export const PAYMENT_STATUS_MAP: Record<
  string,
  { text: string; color: string }
> = {
  PAID: { text: "Đã thanh toán", color: "green" },
  PENDING: { text: "Đang chờ thanh toán", color: "orange" },
  REFUND_PENDING: { text: "Đang chờ hoàn tiền", color: "gold" },
  NO_REFUND: { text: "Không hoàn tiền", color: "red" },
  UNPAID: { text: "Chưa thanh toán", color: "default" },
  FAILED: { text: "Thanh toán thất bại", color: "red" },
  EXPIRED: { text: "Hết hạn thanh toán", color: "volcano" },
  REFUNDED: { text: "Đã hoàn tiền", color: "blue" },
};

export const PAYMENT_STATUS_FLOW: Record<string, string[]> = {
  PAID: [],
  REFUND_PENDING: ["REFUNDED"],
  REFUNDED: [],
};
