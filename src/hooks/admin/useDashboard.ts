import { message as staticMessage, App as AntdApp } from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLazyGetAdminAppointmentsQuery } from "../../app/services/appointmentApi";
import { useLazyGetDoctorsByAdminQuery } from "../../app/services/doctorApi";
import { useLazyGetPatientProfileQuery } from "../../app/services/patientProfile";
import { useLazyGetScheduleDoctorIdQuery } from "../../app/services/scheduleApi";
import { DOCTOR_FETCH_LIMIT } from "../../constants/admin/dashboardContants";
import type {
  AppointmentApi,
  DashboardStats,
  DoctorApi,
  DoctorWithSchedule,
  ProgressStats,
  TableAppointment,
  UpcomingAppointment,
} from "../../types/Dashboard";
import { calcPercent, normalizeStatus } from "../../utils/Dashboard";

// ===== DEFAULT STATE =====

const DEFAULT_STATS: DashboardStats = {
  todayAppointments: 0,
  newPatients: 0,
  doctors: 0,
  completedThisMonth: 0,
};

const DEFAULT_PROGRESS: ProgressStats = {
  total: 0,
  completed: 0,
  confirmed: 0,
  pending: 0,
  cancelled: 0,
  completedPercent: 0,
  confirmedPercent: 0,
  pendingPercent: 0,
};

// ===== HOOK =====

export const useDashboard = () => {
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

  const nav = useNavigate();

  // ===== RTK QUERY LAZY TRIGGERS =====

  const [triggerAppointments] = useLazyGetAdminAppointmentsQuery();
  const [triggerDoctors] = useLazyGetDoctorsByAdminQuery();
  const [triggerPatients] = useLazyGetPatientProfileQuery();
  const [triggerSchedules] = useLazyGetScheduleDoctorIdQuery();

  // ===== STATE =====

  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
  const [progressStats, setProgressStats] =
    useState<ProgressStats>(DEFAULT_PROGRESS);
  const [appointments, setAppointments] = useState<TableAppointment[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingAppointment[]>([]);
  const [doctorsWithSchedule, setDoctorsWithSchedule] = useState<
    DoctorWithSchedule[]
  >([]);
  const [loadingDoctorsSchedule, setLoadingDoctorsSchedule] = useState(false);
  const [searchDoctor, setSearchDoctor] = useState("");

  // ===== FETCH =====

  const fetchDoctorsWithSchedule = async (doctorsData: DoctorApi[]) => {
    try {
      setLoadingDoctorsSchedule(true);

      const activeDoctors = doctorsData.filter((d) => d.is_active !== false);
      const pick = activeDoctors.slice(0, DOCTOR_FETCH_LIMIT);

      const results = await Promise.all(
        pick.map(async (doc): Promise<DoctorWithSchedule> => {
          const base: DoctorWithSchedule = {
            _id: doc._id,
            name: doc.name || doc.fullName || "Bác sĩ",
            avatar: doc.avatar,
            specialty: doc.specialty,
            experience_year: doc.experience_year,
            price: doc.price,
            is_active: doc.is_active,
            upcomingCount: 0,
            nextSlotText: undefined,
          };

          try {
            const scheduleRes = await triggerSchedules(doc._id).unwrap();
            const schedules = scheduleRes.data ?? [];

            const futureSlots: Array<{ time: string; date: string }> = [];
            schedules.forEach((s) => {
              (s.timeSlots || []).forEach((ts) => {
                if (dayjs(ts.date).isAfter(dayjs().startOf("day"))) {
                  futureSlots.push({ time: ts.time, date: ts.date });
                }
              });
            });

            futureSlots.sort(
              (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf(),
            );

            const next = futureSlots[0];
            return {
              ...base,
              upcomingCount: futureSlots.length,
              nextSlotText: next
                ? `${next.time} • ${dayjs(next.date).format("DD/MM")}`
                : undefined,
            };
          } catch {
            return base;
          }
        }),
      );

      const sorted = results
        .filter((d) => (d.upcomingCount || 0) > 0)
        .sort((a, b) => (b.upcomingCount || 0) - (a.upcomingCount || 0));

      setDoctorsWithSchedule(sorted);
    } finally {
      setLoadingDoctorsSchedule(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      const [appointmentRes, doctorRes, patientRes] = await Promise.all([
        triggerAppointments().unwrap(),
        triggerDoctors().unwrap(),
        triggerPatients().unwrap(),
      ]);

      const appointmentsData = (appointmentRes.data || []) as AppointmentApi[];
      const doctorsData = (doctorRes.data || []) as DoctorApi[];
      const patientsData = patientRes.data || [];

      const today = dayjs().format("YYYY-MM-DD");

      // --- Stats ---
      const completedThisMonth = appointmentsData.filter(
        (a) =>
          normalizeStatus(a.status) === "COMPLETED" &&
          dayjs(a.dateTime).isSame(dayjs(), "month"),
      ).length;

      setStats({
        todayAppointments: appointmentsData.filter(
          (a) => dayjs(a.dateTime).format("YYYY-MM-DD") === today,
        ).length,
        newPatients: patientsData.length,
        doctors: doctorsData.length,
        completedThisMonth,
      });

      // --- Recent appointments table (top 5) ---
      setAppointments(
        appointmentsData.slice(0, 5).map((a) => ({
          key: a._id,
          patient: a.patientProfile?.fullName || a.patient?.fullName || "—",
          doctor: a.doctor?.name || "—",
          time: `${a.time} - ${dayjs(a.dateTime).format("DD/MM/YYYY")}`,
          department: a.doctor?.specialty || "—",
          status: a.status,
        })),
      );

      // --- Upcoming appointments list (top 5 future) ---
      setUpcoming(
        appointmentsData
          .filter((a) => dayjs(a.dateTime).isAfter(dayjs()))
          .sort(
            (a, b) => dayjs(a.dateTime).valueOf() - dayjs(b.dateTime).valueOf(),
          )
          .slice(0, 5)
          .map((a) => ({
            name: a.patientProfile?.fullName || a.patient?.fullName || "—",
            time: a.time,
            date: dayjs(a.dateTime).format("DD/MM/YYYY"),
            doctor: a.doctor?.name || "—",
            status: a.status,
          })),
      );

      // --- Progress stats ---
      const total = appointmentsData.length;
      const completed = appointmentsData.filter(
        (a) => normalizeStatus(a.status) === "COMPLETED",
      ).length;
      const confirmed = appointmentsData.filter(
        (a) => normalizeStatus(a.status) === "CONFIRMED",
      ).length;
      const pending = appointmentsData.filter(
        (a) => normalizeStatus(a.status) === "PENDING",
      ).length;
      const cancelled = appointmentsData.filter(
        (a) => normalizeStatus(a.status) === "CANCELLED",
      ).length;

      setProgressStats({
        total,
        completed,
        confirmed,
        pending,
        cancelled,
        completedPercent: calcPercent(completed, total),
        confirmedPercent: calcPercent(confirmed, total),
        pendingPercent: calcPercent(pending, total),
      });

      // --- Doctors with schedule ---
      await fetchDoctorsWithSchedule(doctorsData);
    } catch (err) {
      console.log(err);
      message.error("Không tải được dữ liệu dashboard");
    }
  };

  // ===== ACTIONS =====

  const goToBooking = (doctorId: string) => {
    nav(`/dat-lich-kham?doctorId=${doctorId}`);
  };

  // ===== DERIVED =====

  const filteredDoctors = useMemo(() => {
    const q = searchDoctor.trim().toLowerCase();
    if (!q) return doctorsWithSchedule;
    return doctorsWithSchedule.filter((d) =>
      (d.name || "").toLowerCase().includes(q),
    );
  }, [doctorsWithSchedule, searchDoctor]);

  // ===== RETURN =====

  return {
    // data
    stats,
    progressStats,
    appointments,
    upcoming,
    filteredDoctors,
    loadingDoctorsSchedule,
    searchDoctor,
    // actions
    setSearchDoctor,
    fetchDashboard,
    goToBooking,
  };
};
