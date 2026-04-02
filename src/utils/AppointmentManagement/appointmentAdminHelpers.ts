import type { Appointment } from "../../types/Booking";

export type CancelOption = "REFUND" | "NO_REFUND";

export const buildCanceledReason = (
  appointment: Appointment,
  adminNote: string,
): string | undefined => {
  const clinicReason = adminNote.trim();
  if (clinicReason) return clinicReason;
  return appointment.reason?.trim() || undefined;
};

export const getCancelByText = (canceledBy?: string): string => {
  if (canceledBy === "patient") return "Người dùng";
  if (canceledBy === "clinic") return "Phòng khám";
  if (canceledBy === "system") return "Hệ thống";
  return "---";
};

export const isPaid = (appointment: Appointment): boolean => {
  return (
    String(appointment.payment?.paymentStatus || "").toUpperCase() === "PAID"
  );
};

export const getPatientName = (record: Appointment): string => {
  if (record.patientProfile?.fullName) return record.patientProfile.fullName;
  if (typeof record.patient === "object" && record.patient?.fullName)
    return record.patient.fullName;
  return "---";
};

export const getPatientPhone = (record: Appointment): string => {
  if (record.patientProfile?.phone) return record.patientProfile.phone;
  if (typeof record.patient === "object" && record.patient?.phone)
    return record.patient.phone;
  return "---";
};

export const getBookingAccountEmail = (record: Appointment): string => {
  if (
    typeof record.patient === "object" &&
    record.patient !== null &&
    "email" in record.patient &&
    record.patient.email
  )
    return record.patient.email;
  if (record.patientProfile?.email) return record.patientProfile.email;
  return "---";
};

export const requiresRefundChoice = (
  appointment: Appointment | null,
): boolean => {
  if (!appointment) return false;
  return (
    appointment.status === "CONFIRM" ||
    appointment.status === "CHECKIN" ||
    appointment.status === "REQUEST-CANCELED"
  );
};

export const toArrayQueryValue = (value?: string | null): string[] => {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};
