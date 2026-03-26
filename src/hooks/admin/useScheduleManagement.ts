import { Form, message } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";
import api from "../../api";
import type { Doctor } from "../../types/Doctor";
import type {
  AdminTimeSlot,
  AdminSchedule,
  ScheduleFormValues,
} from "../../types/ScheduleManagement";
import {
  ROOMS,
  TIME_OPTIONS,
  FIXED_BLOCK_TIME_MINUTES,
  MIN_SLOT_GAP_MINUTES,
} from "../../constants/admin/scheduleConstants";
import {
  isBookedLikeStatus,
  getDateKey,
  sortTimeSlots,
} from "../../utils/ScheduleManagement/scheduleUtils";

// Re-export for consumers that previously imported from this hook
export type {
  AdminTimeSlot as TimeSlot,
  AdminSchedule as Schedule,
  ScheduleFormValues as FormValues,
};
export { ROOMS, TIME_OPTIONS, isBookedLikeStatus };

// Local aliases so the hook body stays readable
type TimeSlot = AdminTimeSlot;
type Schedule = AdminSchedule;
type FormValues = ScheduleFormValues;

// ===== HOOK =====

export const useScheduleManagement = () => {
  // ===== STATE =====
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [open, setOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [scheduleViewMode, setScheduleViewMode] = useState<"upcoming" | "past">(
    "upcoming",
  );
  const [tempTimeSlots, setTempTimeSlots] = useState<TimeSlot[]>([]);
  const [form] = Form.useForm<FormValues>();

  const selectedDoctorId = Form.useWatch("doctorId", form);
  const selectedDate = Form.useWatch("date", form);
  const todayStart = useMemo(() => dayjs().startOf("day"), []);

  // ===== DERIVED =====

  const doctorMap = useMemo<Record<string, Doctor>>(() => {
    const map: Record<string, Doctor> = {};
    doctors.forEach((d) => (map[d._id] = d));
    return map;
  }, [doctors]);

  const doctorsWithSchedule = useMemo(
    () => new Set(schedules.map((s) => s.doctorId)),
    [schedules],
  );

  const doctorAssignedRoomMap = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    schedules.forEach((s) => {
      if (!map[s.doctorId]) map[s.doctorId] = s.roomId;
    });
    return map;
  }, [schedules]);

  const roomAssignedDoctorMap = useMemo<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    schedules.forEach((s) => {
      if (!map[s.roomId]) map[s.roomId] = s.doctorId;
      s.timeSlots.forEach((slot) => {
        if (slot.roomId && !map[slot.roomId]) map[slot.roomId] = s.doctorId;
      });
    });
    return map;
  }, [schedules]);

  const roomOptions = useMemo(
    () =>
      ROOMS.map((room) => {
        const assignedDoctorId = roomAssignedDoctorMap[room.id];
        const disabled =
          !!assignedDoctorId &&
          !!selectedDoctorId &&
          assignedDoctorId !== selectedDoctorId;
        return { ...room, disabled };
      }),
    [roomAssignedDoctorMap, selectedDoctorId],
  );

  const availableTimeOptions = useMemo(() => {
    if (!selectedDate || !selectedDoctorId) return TIME_OPTIONS;
    const dateKey = selectedDate.format("YYYY-MM-DD");
    const usedTimes = new Set(
      tempTimeSlots
        .filter((slot) => getDateKey(slot.date) === dateKey)
        .map((slot) => slot.time),
    );
    return TIME_OPTIONS.map((opt) => ({
      ...opt,
      disabled: usedTimes.has(opt.value),
    }));
  }, [selectedDate, selectedDoctorId, tempTimeSlots]);

  const getVisibleSlots = (slots: TimeSlot[]) =>
    slots.filter((slot) => {
      const slotDay = dayjs(slot.date).startOf("day");
      return scheduleViewMode === "upcoming"
        ? slotDay.isSame(todayStart) || slotDay.isAfter(todayStart)
        : slotDay.isBefore(todayStart);
    });

  const displaySchedules = useMemo(
    () => schedules.filter((s) => getVisibleSlots(s.timeSlots).length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [schedules, scheduleViewMode, todayStart],
  );

  // ===== FETCH =====

  const fetchDoctors = async () => {
    try {
      const res = await api.get<{ data: Doctor[] }>("/doctors");
      setDoctors(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: Schedule[] }>("/schedules");
      setSchedules(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ===== EFFECTS =====

  useEffect(() => {
    fetchDoctors();
    fetchSchedules();
  }, []);

  // ===== ACTIONS =====

  const disabledDate = (current: Dayjs) =>
    current && current.isBefore(dayjs().add(1, "day").startOf("day"));

  const handleDoctorChange = (doctorId: string) => {
    const assignedRoomId = doctorAssignedRoomMap[doctorId];
    const assignedRoomName = ROOMS.find((r) => r.id === assignedRoomId)?.name;
    if (assignedRoomId) {
      form.setFieldsValue({
        roomId: assignedRoomId,
        roomName: assignedRoomName,
      });
    }
  };

  const addTimeSlot = () => {
    const date: Dayjs = form.getFieldValue("date");
    const times: string[] = form.getFieldValue("times");
    const roomId: number = form.getFieldValue("roomId");
    const roomName: string = form.getFieldValue("roomName");

    if (!roomId) {
      message.warning("Vui lòng chọn phòng trước khi thêm khung giờ!");
      return;
    }
    if (!date) {
      message.warning("Vui lòng chọn ngày!");
      return;
    }
    if (!times || times.length === 0) {
      message.warning("Vui lòng chọn ít nhất 1 khung giờ!");
      return;
    }

    const dateKey = date.format("YYYY-MM-DD");
    const newSlots: TimeSlot[] = [];
    const conflicts: string[] = [];

    for (const timeStr of times) {
      const slotTime = dayjs(`${dateKey} ${timeStr}`);
      const tooClose = tempTimeSlots.some((s) => {
        if (getDateKey(s.date) !== dateKey) return false;
        const oldStart = dayjs(
          `${dayjs(s.date).format("YYYY-MM-DD")} ${s.time}`,
        );
        return (
          Math.abs(slotTime.diff(oldStart, "minute")) < MIN_SLOT_GAP_MINUTES
        );
      });

      if (tooClose) {
        conflicts.push(timeStr);
        continue;
      }

      newSlots.push({
        date: slotTime.startOf("day").toISOString(),
        time: timeStr,
        status: "AVAILABLE",
        capacity: 1,
        blockTime: FIXED_BLOCK_TIME_MINUTES,
        roomId,
        roomName,
      });
    }

    if (newSlots.length === 0) {
      message.error(
        conflicts.length > 0
          ? `Tất cả khung giờ đã chọn đều bị xung đột: ${conflicts.join(", ")}`
          : "Không thể thêm khung giờ nào. Vui lòng kiểm tra lại.",
      );
      return;
    }

    setTempTimeSlots((prev) => sortTimeSlots([...prev, ...newSlots]));

    if (conflicts.length > 0) {
      message.warning(
        `Đã thêm ${newSlots.length} khung giờ. Bỏ qua ${conflicts.length} khung giờ bị xung đột: ${conflicts.join(", ")}`,
      );
    } else {
      message.success(`Đã thêm ${newSlots.length} khung giờ`);
    }

    form.setFieldsValue({ times: undefined });
  };

  const removeTempSlot = (index: number) => {
    const slot = tempTimeSlots[index];
    if (slot && isBookedLikeStatus(slot.status)) {
      message.warning("Không thể xóa slot đã được đặt");
      return;
    }
    setTempTimeSlots((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const handleSubmit = async (values: FormValues) => {
    if (!tempTimeSlots.length) {
      message.error("Chưa có khung giờ nào được thêm!");
      return;
    }

    const doctor = doctorMap[values.doctorId];
    const bookedCount = tempTimeSlots.filter((s) =>
      isBookedLikeStatus(s.status),
    ).length;

    if (bookedCount > 0 && editingSchedule) {
      message.warning(
        `Lưu ý: Có ${bookedCount} khung giờ đã được đặt. Hãy cẩn thận khi xóa!`,
      );
    }

    const isChangingRoom =
      editingSchedule && editingSchedule.roomId !== values.roomId;
    if (!editingSchedule || isChangingRoom) {
      const roomTaken = schedules.some((s) => {
        if (editingSchedule && s._id === editingSchedule._id) return false;
        if (s.doctorId === values.doctorId) return false;
        if (s.roomId === values.roomId) return true;
        return s.timeSlots.some((slot) => slot.roomId === values.roomId);
      });

      if (roomTaken) {
        message.error(
          "Phòng này đã được gán cho bác sĩ khác. Vui lòng chọn phòng trống.",
        );
        return;
      }
    }

    const payload = {
      doctorId: values.doctorId,
      roomId: values.roomId,
      roomName: values.roomName,
      price: Number(doctor?.price ?? 0),
      timeSlots: tempTimeSlots,
    };

    try {
      if (editingSchedule) {
        await api.put(`/schedules/${editingSchedule._id}`, payload);
        message.success("Cập nhật lịch thành công");
      } else {
        const alreadyHasSchedule = schedules.find(
          (s) => s.doctorId === values.doctorId,
        );
        if (alreadyHasSchedule) {
          message.warning(
            "Bác sĩ này đã có lịch. Vui lòng bấm 'Sửa' ở danh sách để thêm lịch tiếp theo.",
          );
          return;
        }
        await api.post("/schedules", payload);
        message.success("Tạo lịch thành công");
      }

      setOpen(false);
      setEditingSchedule(null);
      setTempTimeSlots([]);
      form.resetFields();
      fetchSchedules();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(
        err?.response?.data?.message || "Có lỗi xảy ra khi lưu lịch!",
      );
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      await api.delete(`/schedules/${id}`);
      message.success("Xóa lịch thành công");
      fetchSchedules();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(
        err?.response?.data?.message ||
          "Xóa thất bại. Có thể lịch này đã có người đặt.",
      );
    }
  };

  const openCreateModal = () => {
    form.resetFields();
    setTempTimeSlots([]);
    setEditingSchedule(null);
    setOpen(true);
  };

  const openEditModal = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setTempTimeSlots(schedule.timeSlots);
    form.setFieldsValue({
      doctorId: schedule.doctorId,
      roomId: schedule.roomId,
      roomName: schedule.roomName,
      date: undefined,
      times: undefined,
    });
    setOpen(true);
  };

  return {
    // Data
    doctors,
    loading,
    displaySchedules,
    tempTimeSlots,
    // Form
    form,
    editingSchedule,
    // Modal
    open,
    setOpen,
    // Options & Maps
    doctorMap,
    doctorsWithSchedule,
    roomOptions,
    availableTimeOptions,
    // View toggle
    scheduleViewMode,
    setScheduleViewMode,
    // Helpers
    getVisibleSlots,
    disabledDate,
    // Handlers
    handleDoctorChange,
    addTimeSlot,
    removeTempSlot,
    handleSubmit,
    handleDeleteSchedule,
    openCreateModal,
    openEditModal,
  };
};
