import dayjs from "dayjs";
import { BLOCK_STATUSES } from "../../types/Booking";
import type { Appointment } from "../../types/Booking";
import type { TimeSlot, TimeSlotUI } from "../../types/Schedule";

/**
 * Tính trạng thái disabled cho từng time slot dựa trên:
 * - Slot đã bị đặt bởi bác sĩ khác (doctorBlocked)
 * - Slot trùng giờ với lịch của user (userHasConflict)
 * - Slot không khả dụng (status !== AVAILABLE)
 */
export const buildSlotsWithState = (
  timeSlots: TimeSlot[],
  bookingsBySchedule: Appointment[],
  bookingsByUser: Appointment[],
): TimeSlotUI[] => {
  const today = dayjs().startOf("day");

  return timeSlots
    .filter((slot) => dayjs(slot.date).startOf("day").isAfter(today))
    .map((slot) => {
      const slotDate = dayjs(slot.date).format("YYYY-MM-DD");

      const doctorBlocked = bookingsBySchedule.some(
        (apm) =>
          dayjs(apm.dateTime).format("YYYY-MM-DD") === slotDate &&
          apm.time === slot.time &&
          BLOCK_STATUSES.includes(apm.status),
      );

      const userHasConflict = bookingsByUser.some(
        (apm) =>
          dayjs(apm.dateTime).format("YYYY-MM-DD") === slotDate &&
          apm.time === slot.time &&
          BLOCK_STATUSES.includes(apm.status),
      );

      const disabled =
        slot.status !== "AVAILABLE" || doctorBlocked || userHasConflict;

      return {
        ...slot,
        disabled,
        disabledReason: doctorBlocked
          ? "Khung giờ đã được đặt"
          : userHasConflict
            ? "Bạn đã có lịch khám cùng khung giờ này"
            : slot.status !== "AVAILABLE"
              ? "Khung giờ không khả dụng"
              : undefined,
      };
    });
};
