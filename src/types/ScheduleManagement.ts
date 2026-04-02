import type { Dayjs } from "dayjs";

export interface AdminTimeSlot {
  date: string;
  time: string;
  status: "AVAILABLE" | "BOOKED";
  capacity: number;
  blockTime: number;
  roomId?: number;
  roomName?: string;
}

export interface AdminSchedule {
  _id: string;
  doctorId: string;
  roomId: number;
  roomName: string;
  price: number;
  timeSlots: AdminTimeSlot[];
}

export interface ScheduleFormValues {
  doctorId: string;
  roomId: number;
  roomName: string;
  date?: Dayjs;
  times?: string[];
}
