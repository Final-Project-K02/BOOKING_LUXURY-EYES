import type { Dayjs } from "dayjs";
import type { AppointmentStatus } from "./Booking";

export type CancelOption = "REFUND" | "NO_REFUND";

export type FilterState = {
  dateRange: [Dayjs | null, Dayjs | null] | null;
  statusFilters: AppointmentStatus[];
  paymentStatusFilters: string[];
  doctorFilter: string | undefined;
  patientKeyword: string;
};
