import { message as staticMessage, App as AntdApp } from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hook";
import { useGetDoctorsQuery } from "../../app/services/doctorApi";
import { scheduleApi } from "../../app/services/scheduleApi";
import { HOME_FEATURES, HOME_NEWS } from "../../constants/client/HomeContants";
import type { Doctor } from "../../types/Doctor";
import type { DoctorWithSchedule, ScheduleApi } from "../../types/HomePage";

type AuthModalMode = "login" | "register";

export const useHomePage = () => {
  // ===== HOOKS =====
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let message: any = staticMessage;
  try {
    const app = AntdApp.useApp();
    if (app?.message) {
      message = app.message;
    }
  } catch {
    message = staticMessage;
  }

  // ===== STATE =====
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>("login");
  const [doctorsWithSchedule, setDoctorsWithSchedule] = useState<
    DoctorWithSchedule[]
  >([]);
  const [loadingDoctorsSchedule, setLoadingDoctorsSchedule] = useState(false);

  // ===== FETCH =====
  const navigate = useNavigate();
  const authState = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { data: doctorsData } = useGetDoctorsQuery();

  const doctors = useMemo<Doctor[]>(
    () => doctorsData?.data ?? [],
    [doctorsData],
  );

  const experiencedDoctors = useMemo(() => {
    return doctors
      .map((doc) => ({ ...doc, experience_year: Number(doc.experience_year) }))
      .filter((doc) => Number(doc.experience_year) >= 10);
  }, [doctors]);

  const hasLocalSession = Boolean(
    localStorage.getItem("accessToken") && localStorage.getItem("user"),
  );
  const isAuthenticated = authState.isAuthenticated || hasLocalSession;

  const fetchSchedulesByDoctor = useCallback(
    async (doctorId: string) => {
      const res = await dispatch(
        scheduleApi.endpoints.getScheduleDoctorId.initiate(doctorId),
      ).unwrap();
      return (res.data ?? []) as ScheduleApi[];
    },
    [dispatch],
  );

  const fetchDoctorsWithSchedule = useCallback(async () => {
    try {
      setLoadingDoctorsSchedule(true);

      const activeDoctors = doctors.filter(
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
        .filter((d) => d.upcomingCount > 0)
        .sort((a, b) => b.upcomingCount - a.upcomingCount);

      setDoctorsWithSchedule(filtered);
    } catch (error) {
      console.log(error);
      message.error("Không thể tải danh sách bác sĩ có lịch khám");
    } finally {
      setLoadingDoctorsSchedule(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctors, fetchSchedulesByDoctor]);

  // ===== ACTIONS =====
  const handleNavigateWithAuth = useCallback(
    (path: string) => {
      if (!isAuthenticated) {
        setAuthModalMode("login");
        setAuthModalOpen(true);
        return;
      }
      navigate(path);
    },
    [isAuthenticated, navigate],
  );

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  // ===== EFFECTS =====
  useEffect(() => {
    if (doctors.length > 0) {
      void fetchDoctorsWithSchedule();
    }
  }, [doctors, fetchDoctorsWithSchedule]);

  return {
    // Auth
    authModalOpen,
    authModalMode,
    closeAuthModal,
    handleNavigateWithAuth,
    // Doctors
    experiencedDoctors,
    doctorsWithSchedule,
    loadingDoctorsSchedule,
    // Static content
    features: HOME_FEATURES,
    news: HOME_NEWS,
  };
};
