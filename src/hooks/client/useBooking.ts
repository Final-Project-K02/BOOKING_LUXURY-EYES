import { skipToken } from "@reduxjs/toolkit/query";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { message as staticMessage, App as AntdApp } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../app/hook";
import {
  useCreateBookingMutation,
  useCreateVnpayLinkMutation,
  useGetAppointmentsQuery,
  useGetBookingByScheduleIdQuery,
} from "../../app/services/appointmentApi";
import { useGetDoctorsQuery } from "../../app/services/doctorApi";
import {
  useCreatePatientProfileMutation,
  useDeletePatientProfileMutation,
  useGetPatientProfileQuery,
  useUpdatePatientProfileMutation,
} from "../../app/services/patientProfile";
import { useGetScheduleDoctorIdQuery } from "../../app/services/scheduleApi";
import {
  BOOKING_PAGE_SIZE,
  CLINIC_LOCATION,
} from "../../constants/client/bookingAppointmentConstants";
import type { AppointmentStatus } from "../../types/Booking";
import type { Doctor } from "../../types/Doctor";
import type {
  CreatePatientInput,
  PatientResponse,
} from "../../types/PatientProfile";
import type { SelectedSchedule, TimeSlot } from "../../types/Schedule";
import { buildSlotsWithState } from "../../utils/BookingAppointment";

/**
 * Hook chính cho toàn bộ flow đặt lịch:
 * - Tìm kiếm bác sĩ (search, filter, pagination)
 * - Quản lý hồ sơ bệnh nhân (CRUD)
 * - Chọn bác sĩ → chọn slot → xác nhận & thanh toán
 */
export const useBooking = () => {
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
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // ===== STATE =====

  // Doctor search
  const [inputSearch, setInputSearch] = useState<string>("");
  const [delaySearch, setDelaySearch] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Patient profile
  const [selectedPerson, setSelectedPerson] = useState<string>("");
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientResponse | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState(false);

  // Booking
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedSchedule, setSelectedSchedule] =
    useState<SelectedSchedule | null>(null);
  const [symptoms, setSymptoms] = useState<string>("");

  // ===== FETCH =====

  const {
    data: doctorsData,
    isLoading,
    isFetching,
    isError,
    refetch: refetchDoctors,
  } = useGetDoctorsQuery({
    inputSearch: delaySearch,
    scheduleDateFrom: fromDate || undefined,
    scheduleDateTo: toDate || undefined,
    page: currentPage,
    limit: BOOKING_PAGE_SIZE,
  });

  const { data: patientProfileResponse } = useGetPatientProfileQuery();
  const patientList: PatientResponse[] = useMemo(
    () => patientProfileResponse?.data ?? [],
    [patientProfileResponse?.data],
  );

  const { data: schedule, refetch: refetchSchedule } =
    useGetScheduleDoctorIdQuery(selectedDoctor?._id as string, {
      skip: !selectedDoctor?._id,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    });
  const scheduleItem = useMemo(
    () =>
      (schedule?.data ?? []).find(
        (item) => item.doctorId === selectedDoctor?._id,
      ) ?? null,
    [schedule?.data, selectedDoctor?._id],
  );

  const { data: bookingsByScheduleRes } = useGetBookingByScheduleIdQuery(
    scheduleItem?._id ?? skipToken,
    { refetchOnFocus: true, refetchOnReconnect: true },
  );
  const bookingsBySchedule = useMemo(
    () => bookingsByScheduleRes?.data ?? [],
    [bookingsByScheduleRes],
  );

  const { data: bookingsByUserRes } = useGetAppointmentsQuery(
    user?._id ?? skipToken,
    { refetchOnFocus: true, refetchOnReconnect: true },
  );
  const bookingsByUser = useMemo(
    () => bookingsByUserRes?.data ?? [],
    [bookingsByUserRes],
  );

  const [createBooking, { isLoading: isCreatingBooking }] =
    useCreateBookingMutation();
  const [createVnpayLink, { isLoading: isCreatingPaymentLink }] =
    useCreateVnpayLinkMutation();
  const [createPatientProfile, { isLoading: isCreatingPatient }] =
    useCreatePatientProfileMutation();
  const [updatePatientProfile, { isLoading: isUpdatingPatient }] =
    useUpdatePatientProfileMutation();
  const [deletePatientProfile] = useDeletePatientProfileMutation();

  // Derived values
  const doctors = useMemo(() => doctorsData?.data ?? [], [doctorsData]);
  const totalAmount = Number(selectedDoctor?.price) || 0;
  const depositAmount = Math.ceil(totalAmount * 0.4);
  const isSubmitting = isCreatingBooking || isCreatingPaymentLink;

  const slotsWithState = useMemo(
    () =>
      buildSlotsWithState(
        scheduleItem?.timeSlots ?? [],
        bookingsBySchedule,
        bookingsByUser,
      ),
    [scheduleItem?.timeSlots, bookingsByUser, bookingsBySchedule],
  );

  // ===== EFFECTS =====

  // Debounce search input
  useEffect(() => {
    const timeout = setTimeout(() => setDelaySearch(inputSearch), 300);
    return () => clearTimeout(timeout);
  }, [inputSearch]);

  // Reset page khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [delaySearch, fromDate, toDate]);

  // Reset slot khi schedule thay đổi và không có slot
  useEffect(() => {
    if (!scheduleItem || scheduleItem.timeSlots.length === 0) {
      setSelectedDate(null);
      setSelectedSlot(null);
      setSelectedSchedule(null);
    }
  }, [scheduleItem]);

  // ===== ACTIONS =====

  // Doctor search
  const handleReset = () => {
    setInputSearch("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setSelectedSchedule(null);
  };

  const handleRefreshAll = async () => {
    await refetchDoctors();
    if (selectedDoctor?._id) {
      await refetchSchedule();
    }
  };

  const handleRangeChange = (dates: (Dayjs | null)[] | null) => {
    if (dates && dates[0] && dates[1]) {
      setFromDate(dates[0].format("YYYY-MM-DD"));
      setToDate(dates[1].format("YYYY-MM-DD"));
    } else {
      setFromDate("");
      setToDate("");
    }
    setCurrentPage(1);
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setSelectedSchedule(null);
  };

  const disabledDate = (current: Dayjs) =>
    current && current < dayjs().startOf("day");

  // Patient profile
  const handlePatientChange = (value: string) => {
    if (value === "add-new") {
      setIsEditing(false);
      setEditingPatient(null);
      setShowAddPatientModal(true);
    } else {
      setSelectedPerson(value);
    }
  };

  const openEditModal = (patient: PatientResponse) => {
    setEditingPatient(patient);
    setIsEditing(true);
    setShowAddPatientModal(true);
  };

  const closeModal = () => {
    setShowAddPatientModal(false);
    setEditingPatient(null);
    setIsEditing(false);
  };

  const handleAddPatient = async (values: CreatePatientInput) => {
    try {
      if (isEditing && editingPatient) {
        await updatePatientProfile({
          id: editingPatient._id,
          body: values,
        }).unwrap();
        message.success("Cập nhật thông tin thành công");
      } else {
        const res = await createPatientProfile(values).unwrap();
        setSelectedPerson(res.data._id);
        message.success("Thêm hồ sơ thành công");
      }
      setShowAddPatientModal(false);
      setEditingPatient(null);
    } catch (err) {
      console.error("Error:", err);
      const error = err as FetchBaseQueryError;
      const apiError = error.data as
        | { message?: string; error?: string[] }
        | undefined;
      if (Array.isArray(apiError?.error)) {
        message.error(apiError.error.join(" | "));
        return;
      }
      if (typeof apiError?.message === "string") {
        message.error(apiError.message);
        return;
      }
      message.error(isEditing ? "Cập nhật thất bại" : "Thêm hồ sơ thất bại");
    }
  };

  const handleDeletePatient = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa hồ sơ này không?")) return;
    try {
      await deletePatientProfile(id).unwrap();
      if (selectedPerson === id) setSelectedPerson("");
      message.success("Xóa hồ sơ thành công");
    } catch (error) {
      console.log(error);
      message.error("Xóa hồ sơ thất bại");
    }
  };

  // Booking
  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate(null);
    setSelectedSlot(null);
    setSelectedSchedule(null);
  };

  const handleTimeSelect = (slot: TimeSlot) => {
    if (selectedDoctor && scheduleItem) {
      setSelectedSlot(slot);
      setSelectedSchedule({
        scheduleSlotId: slot.scheduleSlotId,
        date: slot.date,
        time: slot.time,
        location: CLINIC_LOCATION,
        room: scheduleItem.roomName,
        displayDate: `${slot.time} - ${dayjs(slot.date).format("DD/MM")}`,
      });
    }
  };

  const handleBackToList = () => {
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setSelectedSchedule(null);
  };

  const handleConfirmBooking = async (patientProfileId: string) => {
    if (!user?._id || !isAuthenticated) {
      message.error("Vui lòng đăng nhập");
      nav("/auth/login");
      return false;
    }
    if (!patientProfileId) {
      message.error("Vui lòng chọn người tới khám");
      return false;
    }
    if (!selectedDoctor) {
      message.error("Vui lòng chọn bác sĩ");
      return false;
    }
    if (!selectedSchedule || !scheduleItem?._id) {
      message.error("Vui lòng chọn lịch khám");
      return false;
    }

    const payload = {
      userId: user._id,
      scheduleId: scheduleItem._id,
      scheduleSlotId: Number(selectedSchedule.scheduleSlotId) || 0,
      dateTime: selectedSchedule.date ?? "",
      time: selectedSchedule.time ?? "",
      blockTime: 30,
      location: selectedSchedule.location ?? "",
      status: "PENDING" as AppointmentStatus,
      appointmentMethod: "DIRECT",
      symptoms,
      payment: {
        totalAmount,
        paymentMethod: "VNPAY",
        paymentStatus: "UNPAID",
      },
      doctor: {
        id: selectedDoctor._id ?? "",
        name: selectedDoctor.name ?? "",
        avatar: selectedDoctor.avatar ?? "",
        experience_year: Number(selectedDoctor.experience_year) || 0,
      },
      room: {
        id: scheduleItem.roomId ?? 1,
        name: scheduleItem.roomName,
      },
      patientProfileId: patientProfileId || undefined,
    };

    if (
      !confirm(
        `Xác nhận đặt lịch khám?\n\nTiền cọc cần thanh toán: ${depositAmount.toLocaleString("vi-VN")} đ\nBạn có 5 phút để hoàn tất thanh toán.`,
      )
    ) {
      return false;
    }

    try {
      const bookingRes = await createBooking(payload).unwrap();
      const appointmentId = bookingRes?.data?._id;

      if (!appointmentId) {
        message.success("Đặt lịch thành công");
        nav("/lich-kham");
        return true;
      }

      try {
        const payRes = await createVnpayLink(appointmentId).unwrap();
        const paymentUrl = payRes?.data?.paymentUrl;

        if (!paymentUrl) {
          message.warning(
            "Lịch đã được tạo. Bạn có thể thanh toán trong trang Lịch khám trong vòng 5 phút.",
          );
          nav("/lich-kham");
          return true;
        }

        message.loading("Đang chuyển tới cổng thanh toán...", 1);
        window.location.href = paymentUrl;
        return true;
      } catch (paymentError) {
        const pe = paymentError as { data?: { message?: string } };
        message.warning(
          pe?.data?.message ||
            "Lịch đã được tạo. Bạn có thể thanh toán trong trang Lịch khám trong vòng 5 phút.",
        );
        nav("/lich-kham");
        return true;
      }
    } catch (error) {
      const e = error as { data?: { message?: string } };
      message.error(
        e?.data?.message || "Đặt lịch thất bại, vui lòng thử lại sau",
      );
    }

    return false;
  };

  return {
    // Doctor search
    inputSearch,
    setInputSearch,
    fromDate,
    toDate,
    currentPage,
    setCurrentPage,
    pageSize: BOOKING_PAGE_SIZE,
    doctorsData,
    doctors,
    isLoading,
    isFetching,
    isError,
    refetchDoctors,
    handleRefreshAll,
    handleReset,
    handleRangeChange,
    disabledDate,

    // Patient profile
    selectedPerson,
    patientList,
    showAddPatientModal,
    editingPatient,
    isEditing,
    isCreatingPatient,
    isUpdatingPatient,
    handlePatientChange,
    handleAddPatient,
    handleDeletePatient,
    openEditModal,
    closeModal,

    // Booking
    selectedDoctor,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    selectedSchedule,
    symptoms,
    setSymptoms,
    scheduleItem,
    slotsWithState,
    totalAmount,
    depositAmount,
    isSubmitting,
    handleDoctorSelect,
    handleTimeSelect,
    handleBackToList,
    handleConfirmBooking,
  };
};
