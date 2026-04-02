import dayjs, { Dayjs } from "dayjs";
import type { AdminTimeSlot } from "../../types/ScheduleManagement";

export const isBookedLikeStatus = (status?: string): boolean => {
  const normalized = String(status || "")
    .trim()
    .toUpperCase();
  return normalized !== "" && normalized !== "AVAILABLE";
};

export const getDateKey = (date: string | Dayjs): string =>
  dayjs(date).format("YYYY-MM-DD");

export const sortTimeSlots = (slots: AdminTimeSlot[]): AdminTimeSlot[] =>
  [...slots].sort((a, b) => {
    const timeA = dayjs(`${dayjs(a.date).format("YYYY-MM-DD")} ${a.time}`);
    const timeB = dayjs(`${dayjs(b.date).format("YYYY-MM-DD")} ${b.time}`);
    return timeA.diff(timeB);
  });
