import { useState } from "react";
import { Modal, message } from "antd";
import api from "../../api";
import type { Appointment, AppointmentStatus } from "../../types/Booking";
import {
  STATUS_MAP,
  PAYMENT_STATUS_MAP,
} from "../../constants/AppointmentManagement/appointmentAdminConstants";
import {
  type CancelOption,
  isPaid,
  requiresRefundChoice,
  buildCanceledReason,
  getCancelByText,
} from "../../utils/AppointmentManagement/appointmentAdminHelpers";

interface UseAppointmentActionsProps {
  fetchAppointments: () => void;
  fetchAppointmentDetail: (
    id: string,
    onLoadingChange: (loading: boolean) => void,
  ) => Promise<Appointment | null>;
  setDetailLoading: (loading: boolean) => void;
}

export const useAppointmentActions = ({
  fetchAppointments,
  fetchAppointmentDetail,
  setDetailLoading,
}: UseAppointmentActionsProps) => {
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const [cancelConfirmVisible, setCancelConfirmVisible] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<Appointment | null>(null);
  const [adminCancelNote, setAdminCancelNote] = useState("");
  const [cancelOption, setCancelOption] = useState<CancelOption | undefined>(
    undefined,
  );
  const [submittingCancel, setSubmittingCancel] = useState(false);

  const updateStatus = async (
    id: string,
    status: AppointmentStatus,
    reason?: string,
    paymentStatus?: string,
  ): Promise<boolean> => {
    try {
      await api.patch(`/appointments/${id}`, {
        status,
        ...(reason ? { reason } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
      });
      message.success("Cập nhật trạng thái thành công");
      await fetchAppointments();
      return true;
    } catch {
      message.error("Cập nhật thất bại");
      return false;
    }
  };

  const updatePaymentStatus = async (
    id: string,
    paymentStatus: string,
  ): Promise<boolean> => {
    try {
      await api.patch(`/appointments/${id}`, { paymentStatus });
      message.success("Cập nhật trạng thái hoàn tiền thành công");
      fetchAppointments();
      return true;
    } catch {
      message.error("Cập nhật trạng thái hoàn tiền thất bại");
      return false;
    }
  };

  const handleViewDetail = async (record: Appointment) => {
    setSelectedAppointment(record);
    setDetailModalVisible(true);
    if (!record._id) return;
    const detailData = await fetchAppointmentDetail(
      record._id,
      setDetailLoading,
    );
    if (detailData) setSelectedAppointment(detailData);
  };

  const handleCloseDetail = () => {
    setDetailModalVisible(false);
    setSelectedAppointment(null);
  };

  const confirmUpdateStatus = (
    record: Appointment,
    nextStatus: AppointmentStatus,
  ) => {
    if (
      record.status === "PENDING" &&
      nextStatus === "CONFIRM" &&
      !isPaid(record)
    ) {
      message.warning(
        "Lịch chưa thanh toán, không thể chuyển sang Đã xác nhận",
      );
      return;
    }

    if (nextStatus === "CANCELED") {
      setAppointmentToCancel(record);
      setAdminCancelNote("");
      setCancelOption(requiresRefundChoice(record) ? "REFUND" : undefined);
      setCancelConfirmVisible(true);
      return;
    }

    const currentLabel =
      STATUS_MAP[record.status as AppointmentStatus]?.text || record.status;
    const nextLabel = STATUS_MAP[nextStatus]?.text || nextStatus;

    Modal.confirm({
      title: "Xác nhận đổi trạng thái lịch",
      content: `Bạn có chắc muốn đổi từ "${currentLabel}" sang "${nextLabel}"?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: () => {
        if (!record._id) {
          message.error("Không tìm thấy ID lịch hẹn");
          return;
        }
        updateStatus(record._id, nextStatus);
      },
    });
  };

  const handleCloseCancelConfirm = () => {
    setCancelConfirmVisible(false);
    setAppointmentToCancel(null);
    setAdminCancelNote("");
    setCancelOption(undefined);
  };

  const handleConfirmCancelStatus = async () => {
    if (!appointmentToCancel?._id) {
      message.error("Không tìm thấy ID lịch hẹn");
      return;
    }
    if (!adminCancelNote.trim()) {
      message.error("Vui lòng nhập ghi chú hủy lịch của phòng khám");
      return;
    }
    if (requiresRefundChoice(appointmentToCancel) && !cancelOption) {
      message.error("Vui lòng chọn chính sách hoàn tiền");
      return;
    }

    const actionLabel =
      cancelOption === "NO_REFUND" ? "Hủy không hoàn tiền" : "Hủy và hoàn tiền";

    Modal.confirm({
      title: "Xác nhận thao tác hủy lịch",
      content: requiresRefundChoice(appointmentToCancel)
        ? `Bạn có chắc muốn ${actionLabel.toLowerCase()} cho lịch hẹn này không?`
        : "Bạn có chắc muốn hủy lịch hẹn này không?",
      okText: "Xác nhận",
      cancelText: "Đóng",
      onOk: async () => {
        try {
          setSubmittingCancel(true);
          const paymentStatus = requiresRefundChoice(appointmentToCancel)
            ? cancelOption === "NO_REFUND"
              ? "NO_REFUND"
              : "REFUND_PENDING"
            : undefined;

          const updated = await updateStatus(
            appointmentToCancel._id,
            "CANCELED",
            buildCanceledReason(appointmentToCancel, adminCancelNote),
            paymentStatus,
          );

          if (!updated) return;
          handleCloseCancelConfirm();
        } finally {
          setSubmittingCancel(false);
        }
      },
    });
  };

  const confirmUpdatePaymentStatus = (
    record: Appointment,
    nextPaymentStatus: string,
  ) => {
    const currentPaymentStatus = String(
      record.payment?.paymentStatus || "UNPAID",
    ).toUpperCase();
    const currentLabel =
      PAYMENT_STATUS_MAP[currentPaymentStatus]?.text || currentPaymentStatus;
    const nextLabel =
      PAYMENT_STATUS_MAP[nextPaymentStatus]?.text || nextPaymentStatus;

    Modal.confirm({
      title: "Xác nhận cập nhật hoàn tiền",
      content: `Bạn có chắc muốn đổi trạng thái thanh toán từ "${currentLabel}" sang "${nextLabel}"?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: () => {
        if (!record._id) {
          message.error("Không tìm thấy ID lịch hẹn");
          return;
        }
        updatePaymentStatus(record._id, nextPaymentStatus);
      },
    });
  };

  return {
    selectedAppointment,
    detailModalVisible,
    cancelConfirmVisible,
    appointmentToCancel,
    adminCancelNote,
    setAdminCancelNote,
    cancelOption,
    setCancelOption,
    submittingCancel,
    handleViewDetail,
    handleCloseDetail,
    confirmUpdateStatus,
    handleCloseCancelConfirm,
    handleConfirmCancelStatus,
    confirmUpdatePaymentStatus,
    getCancelByText,
  };
};
