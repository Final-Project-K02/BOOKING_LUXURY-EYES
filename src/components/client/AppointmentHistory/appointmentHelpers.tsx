import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { Appointment, AppointmentStatus } from "../../../types/Booking";

export const CANCEL_REASON_OPTIONS = {
  busy: "Bận việc đột xuất",
  rescheduled: "Muốn đổi lịch khác",
} as const;

export const APPOINTMENT_STATUS_CONFIG = {
  PENDING: {
    color: "orange",
    bgColor: "bg-orange-50",
    text: "Chờ thanh toán",
    icon: <ClockCircleOutlined />,
  },
  CONFIRM: {
    color: "blue",
    bgColor: "bg-blue-50",
    text: "Đã xác nhận",
    icon: <CheckCircleOutlined />,
  },
  CHECKIN: {
    color: "purple",
    bgColor: "bg-purple-50",
    text: "Đã check-in",
    icon: <SyncOutlined />,
  },
  DONE: {
    color: "green",
    bgColor: "bg-green-50",
    text: "Hoàn thành",
    icon: <CheckCircleOutlined />,
  },
  CANCELED: {
    color: "red",
    bgColor: "bg-red-50",
    text: "Đã hủy",
    icon: <CloseCircleOutlined />,
  },
  "REQUEST-CANCELED": {
    color: "gold",
    bgColor: "bg-yellow-50",
    text: "Đang yêu cầu hủy",
    icon: <ClockCircleOutlined />,
  },
} as const;

export const getStatusConfig = (status: AppointmentStatus) =>
  APPOINTMENT_STATUS_CONFIG[status];

export const getDoctorName = (appointment: Appointment): string => {
  const doc = appointment?.doctor as
    | { name?: string; fullName?: string }
    | undefined;
  return doc?.name || doc?.fullName || "Bác sĩ";
};

export const getDoctorAvatar = (
  appointment: Appointment,
): string | undefined => {
  if (typeof appointment.doctor === "object") return appointment.doctor?.avatar;
  return undefined;
};

export const getPatientName = (appointment: Appointment): string => {
  if (appointment.patientProfile?.fullName)
    return appointment.patientProfile.fullName;
  if (typeof appointment.patient === "object" && appointment.patient?.fullName)
    return appointment.patient.fullName;
  return "Không rõ";
};

export const getPatientPhone = (appointment: Appointment): string => {
  if (appointment.patientProfile?.phone)
    return appointment.patientProfile.phone;
  if (typeof appointment.patient === "object" && appointment.patient?.phone)
    return appointment.patient.phone;
  return "Không có";
};

export const getTotalAmount = (appointment: Appointment): number =>
  Number(appointment?.payment?.totalAmount || 0);

export const getDepositAmount = (appointment: Appointment): number => {
  const manual = Number(appointment?.payment?.depositAmount || 0);
  if (manual > 0) return manual;
  const total = Number(appointment?.payment?.totalAmount || 0);
  return Math.ceil(total * 0.4);
};

export const getPaymentStatusText = (paymentStatus?: string): string => {
  switch (paymentStatus) {
    case "PAID":
      return "Đã thanh toán";
    case "PENDING":
      return "Đang chờ xử lý";
    case "REFUND_PENDING":
      return "Đang chờ hoàn tiền";
    case "NO_REFUND":
      return "Không hoàn tiền";
    case "REFUNDED":
      return "Đã hoàn tiền";
    case "EXPIRED":
      return "Hết hạn thanh toán";
    case "FAILED":
      return "Thanh toán thất bại";
    case "UNPAID":
    default:
      return "Chưa thanh toán";
  }
};

export const getCanceledByText = (appointment: Appointment): string => {
  if (appointment?.canceledBy === "patient") return "Người dùng";
  if (appointment?.canceledBy === "clinic") return "Phòng khám";
  if (appointment?.canceledBy === "system") return "Hệ thống";
  return "Không rõ";
};

export const getRefundPolicyText = (appointment: Appointment): string => {
  const paymentStatus = appointment?.payment?.paymentStatus;
  if (paymentStatus === "EXPIRED" || appointment?.canceledBy === "system")
    return "Lịch đã bị hệ thống tự động hủy do hết hạn thanh toán";
  if (paymentStatus === "REFUNDED") return "Đã hoàn tiền cọc";
  if (paymentStatus === "REFUND_PENDING")
    return "Đang chờ phòng khám hoàn tiền cọc";
  if (paymentStatus === "NO_REFUND") return "Không hoàn tiền cọc";
  if (paymentStatus === "PAID") {
    if (appointment?.canceledBy === "patient") return "Không hoàn tiền cọc";
    if (appointment?.canceledBy === "clinic")
      return "Phòng khám sẽ xử lý hoàn tiền";
    return "Đã thanh toán, chưa có thông tin hoàn tiền";
  }
  return "Chưa thanh toán hoặc không phát sinh hoàn tiền";
};

export const getRemainingSeconds = (
  expireAt: string | null | undefined,
  now: dayjs.Dayjs,
): number => {
  if (!expireAt) return 0;
  const diff = dayjs(expireAt).diff(now, "second");
  return diff > 0 ? diff : 0;
};

export const formatCountdown = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainSeconds).padStart(2, "0")}`;
};
