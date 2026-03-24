import { message } from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../api";
import type { Doctor } from "../../types/Doctor";

type ScheduleApi = {
  _id: string;
  timeSlots?: Array<{
    time: string;
    date: string;
    status: string;
  }>;
};

export type DoctorWithSchedule = Doctor & {
  upcomingCount: number;
  nextSlotText?: string;
};

export const useHomeDoctorSchedules = (doctors: Doctor[]) => {
  const [doctorsWithSchedule, setDoctorsWithSchedule] = useState<
    DoctorWithSchedule[]
  >([]);
  const [loadingDoctorsSchedule, setLoadingDoctorsSchedule] = useState(false);
  const [searchDoctor, setSearchDoctor] = useState("");

  const fetchSchedulesByDoctor = useCallback(async (doctorId: string) => {
    const res = await api.get("/schedules", { params: { doctorId } });
    return (res.data?.data ?? []) as ScheduleApi[];
  }, []);

  const fetchDoctorsWithSchedule = useCallback(async () => {
    try {
      setLoadingDoctorsSchedule(true);

      const activeDoctors = (doctors || []).filter(
        (d: Doctor & { is_active?: boolean }) => d?.is_active !== false,
      );

      const LIMIT = 12;
      const pick = activeDoctors.slice(0, LIMIT);

      const results = await Promise.all(
        pick.map(async (doc) => {
          try {
            const schedules = await fetchSchedulesByDoctor(doc._id);
            const futureAvailableSlots: Array<{ time: string; date: string }> =
              [];

            schedules.forEach((schedule) => {
              (schedule.timeSlots || []).forEach((slot) => {
                const slotDay = dayjs(slot.date);
                const isFutureOrToday =
                  slotDay.isSame(dayjs(), "day") ||
                  slotDay.isAfter(dayjs(), "day");

                const isAvailable =
                  String(slot.status || "").toUpperCase() === "AVAILABLE";

                if (isFutureOrToday && isAvailable) {
                  futureAvailableSlots.push({
                    time: slot.time,
                    date: slot.date,
                  });
                }
              });
            });

            futureAvailableSlots.sort(
              (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf(),
            );

            const next = futureAvailableSlots[0];

            return {
              ...doc,
              upcomingCount: futureAvailableSlots.length,
              nextSlotText: next
                ? `${next.time} • ${dayjs(next.date).format("DD/MM")}`
                : undefined,
            } as DoctorWithSchedule;
          } catch {
            return {
              ...doc,
              upcomingCount: 0,
              nextSlotText: undefined,
            } as DoctorWithSchedule;
          }
        }),
      );

      const filtered = results
        .filter((doctor) => doctor.upcomingCount > 0)
        .sort((a, b) => b.upcomingCount - a.upcomingCount);

      setDoctorsWithSchedule(filtered);
    } catch (error) {
      console.log(error);
      message.error("Không thể tải danh sách bác sĩ có lịch khám");
    } finally {
      setLoadingDoctorsSchedule(false);
    }
  }, [doctors, fetchSchedulesByDoctor]);

  useEffect(() => {
    if (doctors.length > 0) {
      void fetchDoctorsWithSchedule();
    }
  }, [doctors.length, fetchDoctorsWithSchedule]);

  const filteredDoctorsWithSchedule = useMemo(() => {
    const keyword = searchDoctor.trim().toLowerCase();
    if (!keyword) {
      return doctorsWithSchedule;
    }

    return doctorsWithSchedule.filter((doctor) =>
      String(doctor.name || "")
        .toLowerCase()
        .includes(keyword),
    );
  }, [doctorsWithSchedule, searchDoctor]);

  return {
    doctorsWithSchedule,
    loadingDoctorsSchedule,
    searchDoctor,
    setSearchDoctor,
    filteredDoctorsWithSchedule,
  };
};
