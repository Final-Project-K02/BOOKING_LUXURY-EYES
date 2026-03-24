import { skipToken } from "@reduxjs/toolkit/query";
import { message } from "antd";
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
import { useGetScheduleDoctorIdQuery } from "../../app/services/scheduleApi";
import type { AppointmentStatus } from "../../types/Booking";
import { BLOCK_STATUSES } from "../../types/Booking";
import type { Doctor } from "../../types/Doctor";
import type {
  SelectedSchedule,
  TimeSlot,
  TimeSlotUI,
} from "../../types/Schedule";

/**
 * Quản lý toàn bộ flow đặt lịch: chọn bác sĩ, chọn slot, xác nhận & thanh toán.
 */
export const useBooking = () => {
  const nav = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedSchedule, setSelectedSchedule] =
    useState<SelectedSchedule | null>(null);
  const [symptoms, setSymptoms] = useState<string>("");

  // Schedule của bác sĩ đang chọn
  const { data: schedule } = useGetScheduleDoctorIdQuery(
    selectedDoctor?._id as string,
    {
      skip: !selectedDoctor?._id,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );
  const scheduleItem = useMemo(
    () =>
      (schedule?.data ?? []).find(
        (item) => item.doctorId === selectedDoctor?._id,
      ) ?? null,
    [schedule?.data, selectedDoctor?._id],
  );

  // Lịch hiện tại của user (để kiểm tra xung đột)
  const { data: getBookingUserId } = useGetAppointmentsQuery(
    user?._id ?? skipToken,
    { refetchOnFocus: true, refetchOnReconnect: true },
  );
  const getBookingUserData = useMemo(
    () => getBookingUserId?.data ?? [],
    [getBookingUserId],
  );

  // Lịch đã đặt theo schedule (để kiểm tra slot bị chiếm)
  const { data: getBookingBySlotId } = useGetBookingByScheduleIdQuery(
    scheduleItem?._id ?? skipToken,
    { refetchOnFocus: true, refetchOnReconnect: true },
  );
  const getBookingBySchedIdData = useMemo(
    () => getBookingBySlotId?.data ?? [],
    [getBookingBySlotId],
  );

  const [createBooking, { isLoading: isCreatingBooking }] =
    useCreateBookingMutation();
  const [createVnpayLink, { isLoading: isCreatingPaymentLink }] =
    useCreateVnpayLinkMutation();

  const totalAmount = Number(selectedDoctor?.price) || 0;
  const depositAmount = Math.ceil(totalAmount * 0.4);
  const isSubmitting = isCreatingBooking || isCreatingPaymentLink;

  // Reset slot khi schedule thay đổi và không có slot
  useEffect(() => {
    if (!scheduleItem || scheduleItem.timeSlots.length === 0) {
      setSelectedDate(null);
      setSelectedSlot(null);
      setSelectedSchedule(null);
    }
  }, [scheduleItem]);

  // Tính trạng thái disabled cho từng slot
  const slotsWithState = useMemo<TimeSlotUI[]>(() => {
    if (!scheduleItem?.timeSlots || !getBookingBySchedIdData) return [];
    const today = dayjs().startOf("day");

    return scheduleItem.timeSlots
      .filter((slot) => dayjs(slot.date).startOf("day").isAfter(today))
      .map((slot) => {
        const slotDate = dayjs(slot.date).format("YYYY-MM-DD");

        const doctorBlocked = getBookingBySchedIdData.some(
          (apm) =>
            dayjs(apm.dateTime).format("YYYY-MM-DD") === slotDate &&
            apm.time === slot.time &&
            BLOCK_STATUSES.includes(apm.status),
        );

        const userHasConflict = getBookingUserData.some(
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
  }, [scheduleItem?.timeSlots, getBookingUserData, getBookingBySchedIdData]);

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
        location: "Vân Canh - Hoài Đức",
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

  /**
   * Xác nhận đặt lịch và chuyển tới cổng thanh toán.
   * @param selectedPerson - ID hồ sơ bệnh nhân được chọn
   */
  const handleConfirmBooking = async (selectedPerson: string) => {
    if (!user?._id || !isAuthenticated) {
      message.error("Vui lòng đăng nhập");
      nav("/auth/login");
      return false;
    }
    if (!selectedPerson) {
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
      patientProfileId: selectedPerson || undefined,
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
