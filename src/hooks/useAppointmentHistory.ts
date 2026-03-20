import { message } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useAppSelector } from "../app/hook";
import {
  useCancelAppointmentConfirmMutation,
  useCancelAppointmentMutation,
  useCreateVnpayLinkMutation,
  useLazyGetAppointmentDetailQuery,
  useGetAppointmentsQuery,
} from "../app/services/appointmentApi";
import type { Appointment, AppointmentStatus } from "../types/Booking";
import {
  CANCEL_REASON_OPTIONS,
  getRemainingSeconds,
} from "../components/appointment-history/appointmentHelpers";

export const useAppointmentHistory = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState<string>("");
  const [otherReason, setOtherReason] = useState<string>("");
  const [now, setNow] = useState(dayjs());

  const user = useAppSelector((state) => state.auth.user);

  const { data, isLoading, isError, refetch } = useGetAppointmentsQuery(
    user?._id ?? skipToken,
    {
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
    },
  );

  const appointments = useMemo<Appointment[]>(
    () => data?.data ?? [],
    [data?.data],
  );

  const [cancelAppointment, { isLoading: isCancelling }] =
    useCancelAppointmentMutation();
  const [cancelAppointmentConfirm] = useCancelAppointmentConfirmMutation();
  const [createVnpayLink, { isLoading: isPayingAgain }] =
    useCreateVnpayLinkMutation();
  const [getAppointmentDetail, { isFetching: isDetailLoading }] =
    useLazyGetAppointmentDetailQuery();

  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  const canPayAgain = (appointment: Appointment): boolean => {
    const remaining = getRemainingSeconds(appointment?.payment?.expireAt, now);
    return (
      appointment?.status === "PENDING" &&
      appointment?.payment?.paymentStatus !== "PAID" &&
      remaining > 0
    );
  };

  const isExpiredPayment = (appointment: Appointment): boolean => {
    const remaining = getRemainingSeconds(appointment?.payment?.expireAt, now);
    return (
      appointment?.status === "PENDING" &&
      appointment?.payment?.paymentStatus !== "PAID" &&
      remaining <= 0
    );
  };

  const getPatientCanceledCountThisMonth = (): number => {
    const currentMonth = dayjs();
    return appointments.filter((apt) => {
      if (apt.status !== "CANCELED" || apt.canceledBy !== "patient")
        return false;
      const canceledDate = apt.canceledAt || apt.updatedAt;
      return canceledDate
        ? dayjs(canceledDate).isSame(currentMonth, "month")
        : false;
    }).length;
  };

  const filteredAppointments = useMemo(() => {
    if (activeTab === "all") return appointments;
    return appointments.filter(
      (apt) => apt.status === (activeTab as AppointmentStatus),
    );
  }, [activeTab, appointments]);

  const tabItems = [
    { key: "all", label: `Tất cả (${appointments.length})` },
    {
      key: "PENDING",
      label: `Chờ thanh toán (${appointments.filter((a) => a.status === "PENDING").length})`,
    },
    {
      key: "CONFIRM",
      label: `Đã xác nhận (${appointments.filter((a) => a.status === "CONFIRM").length})`,
    },
    {
      key: "CHECKIN",
      label: `Đã check-in (${appointments.filter((a) => a.status === "CHECKIN").length})`,
    },
    {
      key: "DONE",
      label: `Hoàn thành (${appointments.filter((a) => a.status === "DONE").length})`,
    },
    {
      key: "CANCELED",
      label: `Đã hủy (${appointments.filter((a) => a.status === "CANCELED").length})`,
    },
    {
      key: "REQUEST-CANCELED",
      label: `Đang yêu cầu hủy (${appointments.filter((a) => a.status === "REQUEST-CANCELED").length})`,
    },
  ];

  const handleViewDetail = async (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDetailModalVisible(true);
    if (!appointment?._id) return;
    try {
      const detailRes = await getAppointmentDetail(appointment._id).unwrap();
      if (detailRes?.data) setSelectedAppointment(detailRes.data);
    } catch {
      message.error("Không thể tải chi tiết lịch hẹn");
    }
  };

  const handleCancelAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCancelModalVisible(true);
  };

  const handlePayNow = async (appointmentId: string) => {
    try {
      const res = await createVnpayLink(appointmentId).unwrap();
      const paymentUrl = res?.data?.paymentUrl;
      if (!paymentUrl) {
        message.error("Không tạo được link thanh toán");
        return;
      }
      message.loading("Đang chuyển tới cổng thanh toán...", 1);
      window.location.href = paymentUrl;
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Không thể tạo link thanh toán lại");
      refetch();
    }
  };

  const confirmCancel = async () => {
    if (!cancelReason) {
      message.error("Bạn phải chọn lý do hủy lịch");
      return;
    }
    if (cancelReason === "other" && !otherReason.trim()) {
      message.error("Vui lòng nhập lý do hủy lịch");
      return;
    }
    if (!selectedAppointment?._id) {
      message.error("Lịch hẹn không hợp lệ, không thể hủy");
      return;
    }

    const reason =
      cancelReason === "other"
        ? otherReason.trim()
        : CANCEL_REASON_OPTIONS[
            cancelReason as keyof typeof CANCEL_REASON_OPTIONS
          ] || cancelReason;

    if (getPatientCanceledCountThisMonth() >= 4) {
      message.error("Bạn đã đạt giới hạn 4 lượt hủy trong tháng này");
      return;
    }

    try {
      if (selectedAppointment.status === "PENDING") {
        await cancelAppointment({
          id: selectedAppointment._id,
          reason,
          scheduleId: selectedAppointment.scheduleId,
        }).unwrap();
        message.success("Hủy lịch thành công");
      }
      if (selectedAppointment.status === "CONFIRM") {
        await cancelAppointmentConfirm({
          id: selectedAppointment._id,
          reason,
          scheduleId: selectedAppointment.scheduleId,
        }).unwrap();
        message.success("Gửi yêu cầu hủy lịch thành công");
      }
      refetch();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Thao tác thất bại");
    }

    setCancelModalVisible(false);
    setCancelReason("");
    setOtherReason("");
    setSelectedAppointment(null);
  };

  const closeDetailModal = () => setDetailModalVisible(false);

  const closeCancelModal = () => {
    setCancelModalVisible(false);
    setCancelReason("");
    setOtherReason("");
  };

  return {
    // State
    activeTab,
    setActiveTab,
    selectedAppointment,
    detailModalVisible,
    cancelModalVisible,
    cancelReason,
    setCancelReason,
    otherReason,
    setOtherReason,
    now,
    // Data
    appointments,
    filteredAppointments,
    tabItems,
    // Loading
    isLoading,
    isError,
    isCancelling,
    isPayingAgain,
    isDetailLoading,
    // Handlers
    handleViewDetail,
    handleCancelAppointment,
    handlePayNow,
    confirmCancel,
    closeDetailModal,
    closeCancelModal,
    // Helpers (depend on reactive `now`)
    canPayAgain,
    isExpiredPayment,
  };
};
