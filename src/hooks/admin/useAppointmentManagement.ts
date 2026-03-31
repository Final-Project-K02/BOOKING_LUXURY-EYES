import { useState, useEffect, useMemo } from "react";
import { Modal, message } from "antd";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

import type { Appointment, AppointmentStatus } from "../../types/Booking";
import {
  STATUS_MAP,
  PAYMENT_STATUS_MAP,
  FILTERABLE_STATUSES,
} from "../../constants/admin/appointmentAdminConstants";
import {
  type CancelOption,
  isPaid,
  requiresRefundChoice,
  buildCanceledReason,
  toArrayQueryValue,
} from "../../utils/AppointmentManagement/appointmentAdminHelpers";
import {
  useGetAdminAppointmentsQuery,
  useLazyGetAppointmentDetailQuery,
  useUpdateAppointmentMutation,
} from "../../app/services/appointmentApi";
import { useGetDoctorsByAdminQuery } from "../../app/services/doctorApi";

// ===== TYPES =====

type FilterState = {
  dateRange: [Dayjs | null, Dayjs | null] | null;
  statusFilters: AppointmentStatus[];
  paymentStatusFilters: string[];
  doctorFilter: string | undefined;
  patientKeyword: string;
};

// ===== HOOK =====

export const useAppointmentManagement = () => {
  // ===== STATE =====

  const [searchParams, setSearchParams] = useSearchParams();

  // Filter
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [statusFilters, setStatusFilters] = useState<AppointmentStatus[]>([]);
  const [paymentStatusFilters, setPaymentStatusFilters] = useState<string[]>(
    [],
  );
  const [doctorFilter, setDoctorFilter] = useState<string | undefined>(
    undefined,
  );
  const [patientKeyword, setPatientKeyword] = useState("");

  // Detail modal
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Cancel modal
  const [cancelConfirmVisible, setCancelConfirmVisible] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<Appointment | null>(null);
  const [adminCancelNote, setAdminCancelNote] = useState("");
  const [cancelOption, setCancelOption] = useState<CancelOption | undefined>(
    undefined,
  );
  const [submittingCancel, setSubmittingCancel] = useState(false);

  // ===== RTK QUERY =====

  const queryParams = useMemo((): Record<string, string> => {
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const params: Record<string, string> = {};

    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;

    const statusSet = new Set<string>(FILTERABLE_STATUSES);
    const paymentStatusSet = new Set(Object.keys(PAYMENT_STATUS_MAP));

    const statuses = toArrayQueryValue(searchParams.get("status")).filter((v) =>
      statusSet.has(v),
    );
    if (statuses.length > 0) params.status = statuses.join(",");

    const paymentStatuses = toArrayQueryValue(
      searchParams.get("paymentStatus"),
    ).filter((v) => paymentStatusSet.has(v));
    if (paymentStatuses.length > 0)
      params.paymentStatus = paymentStatuses.join(",");

    const doctorId = searchParams.get("doctorId");
    if (doctorId) params.doctorId = doctorId;

    const patientKeyword = searchParams.get("patientKeyword");
    if (patientKeyword?.trim()) params.patientKeyword = patientKeyword.trim();

    return params;
  }, [searchParams]);

  const {
    data: appointmentsData,
    isFetching: loading,
    refetch: refetchAppointments,
  } = useGetAdminAppointmentsQuery(queryParams, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [fetchAppointmentDetail, { isFetching: detailLoading }] =
    useLazyGetAppointmentDetailQuery();

  const { data: doctorsData } = useGetDoctorsByAdminQuery();

  const [updateAppointment] = useUpdateAppointmentMutation();

  const appointments = appointmentsData?.data ?? [];
  const doctors = doctorsData?.data ?? [];

  // ===== FILTER HELPERS =====

  const buildFilterParams = (
    overrides?: FilterState,
  ): Record<string, string> => {
    const source = overrides ?? {
      dateRange,
      statusFilters,
      paymentStatusFilters,
      doctorFilter,
      patientKeyword,
    };
    const params: Record<string, string> = {};

    if (source.dateRange?.[0])
      params.dateFrom = source.dateRange[0].format("YYYY-MM-DD");
    if (source.dateRange?.[1])
      params.dateTo = source.dateRange[1].format("YYYY-MM-DD");
    if (source.statusFilters.length > 0)
      params.status = source.statusFilters.join(",");
    if (source.paymentStatusFilters.length > 0)
      params.paymentStatus = source.paymentStatusFilters.join(",");
    if (source.doctorFilter) params.doctorId = source.doctorFilter;
    if (source.patientKeyword.trim())
      params.patientKeyword = source.patientKeyword.trim();

    return params;
  };

  const getFiltersFromSearchParams = (): FilterState => {
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const dateFromDayjs = dateFrom ? dayjs(dateFrom) : null;
    const dateToDayjs = dateTo ? dayjs(dateTo) : null;

    const resolvedDateRange =
      dateFromDayjs?.isValid() || dateToDayjs?.isValid()
        ? ([
            dateFromDayjs?.isValid() ? dateFromDayjs : null,
            dateToDayjs?.isValid() ? dateToDayjs : null,
          ] as [Dayjs | null, Dayjs | null])
        : null;

    const statusSet = new Set<string>(FILTERABLE_STATUSES);
    const paymentStatusSet = new Set(Object.keys(PAYMENT_STATUS_MAP));

    const resolvedStatusFilters = toArrayQueryValue(searchParams.get("status"))
      .filter((v) => statusSet.has(v))
      .map((v) => v as AppointmentStatus);

    const resolvedPaymentStatusFilters = toArrayQueryValue(
      searchParams.get("paymentStatus"),
    ).filter((v) => paymentStatusSet.has(v));

    return {
      dateRange: resolvedDateRange,
      statusFilters: resolvedStatusFilters,
      paymentStatusFilters: resolvedPaymentStatusFilters,
      doctorFilter: searchParams.get("doctorId") || undefined,
      patientKeyword: searchParams.get("patientKeyword") || "",
    };
  };

  const handleApplyFilters = () => {
    setSearchParams(buildFilterParams());
  };

  const handleResetFilters = () => {
    setDateRange(null);
    setStatusFilters([]);
    setPaymentStatusFilters([]);
    setDoctorFilter(undefined);
    setPatientKeyword("");
    setSearchParams({});
  };

  // ===== ACTIONS =====

  const updateStatus = async (
    id: string,
    status: AppointmentStatus,
    reason?: string,
    paymentStatus?: string,
  ): Promise<boolean> => {
    try {
      await updateAppointment({
        id,
        status,
        ...(reason ? { reason } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
      }).unwrap();
      message.success("Cập nhật trạng thái thành công");
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
      await updateAppointment({ id, paymentStatus }).unwrap();
      message.success("Cập nhật trạng thái hoàn tiền thành công");
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
    try {
      const result = await fetchAppointmentDetail(record._id).unwrap();
      if (result?.data) setSelectedAppointment(result.data);
    } catch {
      message.error("Không thể tải chi tiết lịch hẹn");
    }
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

  // ===== EFFECTS =====

  // Sync local filter UI state from URL params
  useEffect(() => {
    const filtersFromUrl = getFiltersFromSearchParams();
    setDateRange(filtersFromUrl.dateRange);
    setStatusFilters(filtersFromUrl.statusFilters);
    setPaymentStatusFilters(filtersFromUrl.paymentStatusFilters);
    setDoctorFilter(filtersFromUrl.doctorFilter);
    setPatientKeyword(filtersFromUrl.patientKeyword);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ===== RETURN =====

  return {
    // Data
    appointments,
    doctors,
    loading,
    detailLoading,

    // Filter state
    dateRange,
    setDateRange,
    statusFilters,
    setStatusFilters,
    paymentStatusFilters,
    setPaymentStatusFilters,
    doctorFilter,
    setDoctorFilter,
    patientKeyword,
    setPatientKeyword,
    handleApplyFilters,
    handleResetFilters,

    // Detail modal
    selectedAppointment,
    detailModalVisible,
    handleViewDetail,
    handleCloseDetail,

    // Cancel modal
    cancelConfirmVisible,
    appointmentToCancel,
    adminCancelNote,
    setAdminCancelNote,
    cancelOption,
    setCancelOption,
    submittingCancel,
    handleCloseCancelConfirm,
    handleConfirmCancelStatus,

    // Table actions
    confirmUpdateStatus,
    confirmUpdatePaymentStatus,

    // Reload with current filters
    reload: refetchAppointments,
  };
};
