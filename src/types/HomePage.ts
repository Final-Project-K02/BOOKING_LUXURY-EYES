import type { ReactNode } from "react";
import type { Doctor } from "./Doctor";

export type HomeFeature = {
  icon: ReactNode;
  title: string;
  desc: string;
};

export type HomeNews = {
  title: string;
  date: string;
  img: string;
};

export type ScheduleTimeSlot = {
  time: string;
  date: string;
  status: string;
};

export type ScheduleApi = {
  _id: string;
  timeSlots?: ScheduleTimeSlot[];
};

export type DoctorWithSchedule = Doctor & {
  upcomingCount: number;
  nextSlotText?: string;
};
