import {
  Button,
  DatePicker,
  Descriptions,
  Input,
  Modal,
  Radio,
  Select,
  Table,
  Tag,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useSearchParams } from "react-router-dom";
import api from "../../api";
import type { Appointment } from "../../types/Booking";
import type { Doctor } from "../../types/Doctor";
import type { Dayjs } from "dayjs";
import type { AppointmentStatus } from "../client/AppointmentHistoryPage";

/* ================== STATUS MAP ================== */

const STATUS_MAP: Record<AppointmentStatus, { text: string; color: string }> = {
  PENDING: { text: "Chờ thanh toán", color: "orange" },
  CONFIRM: { text: "Đã xác nhận", color: "green" },
  CHECKIN: { text: "Đã check-in", color: "blue" },
  DONE: { text: "Hoàn thành", color: "cyan" },
  CANCELED: { text: "Đã huỷ", color: "red" },
  "REQUEST-CANCELED": { text: "Yêu cầu huỷ", color: "volcano" },
};

/* ================== STATUS FLOW ================== */

const STATUS_FLOW: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING: ["CONFIRM", "CANCELED"],
  CONFIRM: ["CHECKIN", "CANCELED"],
  CHECKIN: ["DONE", "CANCELED"],
  DONE: [],
  CANCELED: [],
  "REQUEST-CANCELED": ["CANCELED"],
};

const FILTERABLE_STATUSES: AppointmentStatus[] = [
  "PENDING",
  "CONFIRM",
  "CHECKIN",
  "DONE",
  "CANCELED",
];

const PAYMENT_STATUS_MAP: Record<string, { text: string; color: string }> = {
  PAID: { text: "Đã thanh toán", color: "green" },
  PENDING: { text: "Đang chờ thanh toán", color: "orange" },
  REFUND_PENDING: { text: "Đang chờ hoàn tiền", color: "gold" },
  NO_REFUND: { text: "Không hoàn tiền", color: "red" },
  UNPAID: { text: "Chưa thanh toán", color: "default" },
  FAILED: { text: "Thanh toán thất bại", color: "red" },
  EXPIRED: { text: "Hết hạn thanh toán", color: "volcano" },
  REFUNDED: { text: "Đã hoàn tiền", color: "blue" },
};

const PAYMENT_STATUS_FLOW: Record<string, string[]> = {
  PAID: [],
  REFUND_PENDING: ["REFUNDED"],
  REFUNDED: [],
};

const buildCanceledReason = (appointment: Appointment, adminNote: string) => {
  const userReason = appointment.reason?.trim();
  const clinicReason = adminNote.trim();

  // Khi admin xác nhận hủy, ưu tiên lý do do admin nhập.
  if (clinicReason) return clinicReason;
  return userReason || undefined;
};

const getCancelByText = (canceledBy?: string) => {
  if (canceledBy === "patient") return "Người dùng";
  if (canceledBy === "clinic") return "Phòng khám";
  if (canceledBy === "system") return "Hệ thống";
  return "---";
};

const isPaid = (appointment: Appointment) => {
  return (
    String(appointment.payment?.paymentStatus || "").toUpperCase() === "PAID"
  );
};

const getPatientName = (record: Appointment): string => {
  if (record.patientProfile?.fullName) {
    return record.patientProfile.fullName;
  }
  if (typeof record.patient === "object" && record.patient?.fullName) {
    return record.patient.fullName;
  }
  return "---";
};

const getPatientPhone = (record: Appointment): string => {
  if (record.patientProfile?.phone) {
    return record.patientProfile.phone;
  }
  if (typeof record.patient === "object" && record.patient?.phone) {
    return record.patient.phone;
  }
  return "---";
};

const getBookingAccountEmail = (record: Appointment): string => {
  if (typeof record.patient === "object" && record.patient?.email) {
    return record.patient.email;
  }
  if (record.patientProfile?.email) {
    return record.patientProfile.email;
  }
  return "---";
};

type CancelOption = "REFUND" | "NO_REFUND";

const requiresRefundChoice = (appointment: Appointment | null) => {
  if (!appointment) return false;
  return (
    appointment.status === "CONFIRM" ||
    appointment.status === "CHECKIN" ||
    appointment.status === "REQUEST-CANCELED"
  );
};

const toArrayQueryValue = (value?: string | null) => {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const AppointmentManagement = () => {
  const { TextArea } = Input;
  const { RangePicker } = DatePicker;
  const [searchParams, setSearchParams] = useSearchParams();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [cancelConfirmVisible, setCancelConfirmVisible] =
    useState<boolean>(false);
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<Appointment | null>(null);
  const [adminCancelNote, setAdminCancelNote] = useState<string>("");
  const [cancelOption, setCancelOption] = useState<CancelOption | undefined>(
    undefined,
  );
  const [submittingCancel, setSubmittingCancel] = useState<boolean>(false);
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
  const [patientKeyword, setPatientKeyword] = useState<string>("");

  const buildFilterParams = (filters?: {
    dateRange: [Dayjs | null, Dayjs | null] | null;
    statusFilters: AppointmentStatus[];
    paymentStatusFilters: string[];
    doctorFilter?: string;
    patientKeyword: string;
  }) => {
    const source = filters ?? {
      dateRange,
      statusFilters,
      paymentStatusFilters,
      doctorFilter,
      patientKeyword,
    };
    const params: Record<string, string> = {};

    if (source.dateRange?.[0]) {
      params.dateFrom = source.dateRange[0].format("YYYY-MM-DD");
    }

    if (source.dateRange?.[1]) {
      params.dateTo = source.dateRange[1].format("YYYY-MM-DD");
    }

    if (source.statusFilters.length > 0) {
      params.status = source.statusFilters.join(",");
    }

    if (source.paymentStatusFilters.length > 0) {
      params.paymentStatus = source.paymentStatusFilters.join(",");
    }

    if (source.doctorFilter) {
      params.doctorId = source.doctorFilter;
    }

    if (source.patientKeyword.trim()) {
      params.patientKeyword = source.patientKeyword.trim();
    }

    return params;
  };

  const getFiltersFromSearchParams = () => {
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const dateFromDayjs = dateFrom ? dayjs(dateFrom) : null;
    const dateToDayjs = dateTo ? dayjs(dateTo) : null;
    const resolvedDateRange =
      dateFromDayjs?.isValid() || dateToDayjs?.isValid()
        ? [
            dateFromDayjs?.isValid() ? dateFromDayjs : null,
            dateToDayjs?.isValid() ? dateToDayjs : null,
          ]
        : null;

    const statusSet = new Set(FILTERABLE_STATUSES);
    const paymentStatusSet = new Set(Object.keys(PAYMENT_STATUS_MAP));

    const resolvedStatusFilters = toArrayQueryValue(searchParams.get("status"))
      .filter((value) => statusSet.has(value))
      .map((value) => value as AppointmentStatus);

    const resolvedPaymentStatusFilters = toArrayQueryValue(
      searchParams.get("paymentStatus"),
    ).filter((value) => paymentStatusSet.has(value));

    const resolvedDoctorFilter = searchParams.get("doctorId") || undefined;
    const resolvedPatientKeyword = searchParams.get("patientKeyword") || "";

    return {
      dateRange: resolvedDateRange,
      statusFilters: resolvedStatusFilters,
      paymentStatusFilters: resolvedPaymentStatusFilters,
      doctorFilter: resolvedDoctorFilter,
      patientKeyword: resolvedPatientKeyword,
    };
  };

  const fetchAppointments = async (customParams?: Record<string, string>) => {
    try {
      setLoading(true);
      const res = await api.get<{ data: Appointment[] }>("/appointments", {
        params: customParams ?? buildFilterParams(),
      });
      setAppointments(res.data.data ?? []);
    } catch {
      message.error("Không thể tải lịch hẹn");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await api.get<{ data: Doctor[] }>("/doctors/admin");
      setDoctors(res.data.data ?? []);
    } catch {
      message.error("Không thể tải danh sách bác sĩ");
    }
  };

  const fetchAppointmentDetail = async (id: string) => {
    try {
      setDetailLoading(true);
      const res = await api.get<{ data: Appointment }>(`/appointments/${id}`);
      return res.data.data;
    } catch {
      message.error("Không thể tải chi tiết lịch hẹn");
      return null;
    } finally {
      setDetailLoading(false);
    }
  };

  const handleViewDetail = async (record: Appointment) => {
    setSelectedAppointment(record);
    setDetailModalVisible(true);

    if (!record._id) {
      return;
    }

    const detailData = await fetchAppointmentDetail(record._id);
    if (detailData) {
      setSelectedAppointment(detailData);
    }
  };

  useEffect(() => {
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const filtersFromUrl = getFiltersFromSearchParams();

    setDateRange(filtersFromUrl.dateRange);
    setStatusFilters(filtersFromUrl.statusFilters);
    setPaymentStatusFilters(filtersFromUrl.paymentStatusFilters);
    setDoctorFilter(filtersFromUrl.doctorFilter);
    setPatientKeyword(filtersFromUrl.patientKeyword);

    fetchAppointments(buildFilterParams(filtersFromUrl));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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

  const updateStatus = async (
    id: string,
    status: AppointmentStatus,
    reason?: string,
    paymentStatus?: string,
  ) => {
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

  const updatePaymentStatus = async (id: string, paymentStatus: string) => {
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

    const currentLabel = STATUS_MAP[record.status]?.text || record.status;
    const nextLabel = STATUS_MAP[nextStatus]?.text || nextStatus;

    if (nextStatus === "CANCELED") {
      setAppointmentToCancel(record);
      setAdminCancelNote("");
      setCancelOption(requiresRefundChoice(record) ? "REFUND" : undefined);
      setCancelConfirmVisible(true);
      return;
    }

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

          const updatedStatus = await updateStatus(
            appointmentToCancel._id,
            "CANCELED",
            buildCanceledReason(appointmentToCancel, adminCancelNote),
            paymentStatus,
          );

          if (!updatedStatus) return;

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

  /* ================== TABLE COLUMNS ================== */

  const columns: ColumnsType<Appointment> = [
    {
      title: "Bệnh nhân",
      render: (_, record) => getPatientName(record),
    },
    {
      title: "Bác sĩ",
      render: (_, record) => record.doctor?.name ?? "---",
    },
    {
      title: "Ngày khám",
      render: (_, record) =>
        record.dateTime
          ? new Date(record.dateTime).toLocaleDateString("vi-VN")
          : "---",
    },
    {
      title: "Giờ",
      dataIndex: "time",
    },
    {
      title: "Phòng",
      render: (_, record) => record.room?.name ?? "---",
    },
    {
      title: "Thanh toán",
      render: (_, record) => {
        const key = String(
          record.payment?.paymentStatus || "UNPAID",
        ).toUpperCase();
        const paymentStatus = PAYMENT_STATUS_MAP[key] || {
          text: key,
          color: "default",
        };

        return <Tag color={paymentStatus.color}>{paymentStatus.text}</Tag>;
      },
    },
    {
      title: "Người hủy",
      render: (_, record) => {
        if (record.status !== "CANCELED") return "---";
        return getCancelByText(record.canceledBy);
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: AppointmentStatus, record) => {
        if (status === "PENDING") {
          const pendingText = isPaid(record)
            ? "Chờ xác nhận"
            : "Chờ thanh toán";
          return <Tag color="orange">{pendingText}</Tag>;
        }

        const s = STATUS_MAP[status];
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: "Thao tác",
      render: (_, record) => {
        const allowedStatus = (STATUS_FLOW[record.status] || []).filter(
          (status) => {
            if (
              record.status === "PENDING" &&
              status === "CONFIRM" &&
              !isPaid(record)
            ) {
              return false;
            }
            return true;
          },
        );
        const currentPaymentStatus = String(
          record.payment?.paymentStatus || "UNPAID",
        ).toUpperCase();
        const isCanceledByClinic =
          record.status === "CANCELED" && record.canceledBy === "clinic";
        const allowedPaymentStatuses = isCanceledByClinic
          ? PAYMENT_STATUS_FLOW[currentPaymentStatus] || []
          : [];

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Button
              type="link"
              onClick={() => {
                handleViewDetail(record);
              }}
            >
              Xem chi tiết
            </Button>

            {allowedStatus.length > 0 && (
              <Select
                placeholder="Đổi trạng thái lịch"
                style={{ width: 180 }}
                onChange={(value) => {
                  confirmUpdateStatus(record, value as AppointmentStatus);
                }}
                options={allowedStatus.map((status) => ({
                  value: status,
                  label: STATUS_MAP[status].text,
                }))}
              />
            )}

            {allowedPaymentStatuses.length > 0 && (
              <Select
                placeholder="Cập nhật hoàn tiền"
                style={{ width: 180 }}
                onChange={(value) => {
                  confirmUpdatePaymentStatus(record, String(value));
                }}
                options={allowedPaymentStatuses.map((status) => ({
                  value: status,
                  label: PAYMENT_STATUS_MAP[status]?.text || status,
                }))}
              />
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div
        style={{
          marginBottom: 16,
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <RangePicker
          value={dateRange}
          onChange={(values) => setDateRange(values)}
          format="DD/MM/YYYY"
          allowClear
        />

        <Select
          mode="multiple"
          allowClear
          placeholder="Trạng thái lịch"
          value={statusFilters}
          onChange={(values) => setStatusFilters(values as AppointmentStatus[])}
          options={FILTERABLE_STATUSES.map((status) => ({
            value: status,
            label: STATUS_MAP[status].text,
          }))}
        />

        <Select
          mode="multiple"
          allowClear
          placeholder="Trạng thái thanh toán"
          value={paymentStatusFilters}
          onChange={(values) => setPaymentStatusFilters(values)}
          options={Object.entries(PAYMENT_STATUS_MAP).map(
            ([value, config]) => ({
              value,
              label: config.text,
            }),
          )}
        />

        <Select
          showSearch
          allowClear
          placeholder="Lọc theo bác sĩ"
          value={doctorFilter}
          onChange={(value) => setDoctorFilter(value)}
          optionFilterProp="label"
          options={doctors.map((doctor) => ({
            value: doctor._id,
            label: doctor.name,
          }))}
        />

        <Input
          allowClear
          placeholder="Tìm bệnh nhân (tên, sđt, CCCD, email)"
          value={patientKeyword}
          onChange={(e) => setPatientKeyword(e.target.value)}
          onPressEnter={handleApplyFilters}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button type="primary" loading={loading} onClick={handleApplyFilters}>
            Áp dụng lọc
          </Button>
          <Button onClick={handleResetFilters}>Xóa lọc</Button>
        </div>
      </div>
      <Button loading={loading} onClick={() => fetchAppointments()}>
        Load dữ liệu
      </Button>

      <Table<Appointment>
        rowKey="_id"
        loading={loading}
        columns={columns}
        dataSource={appointments}
      />

      <Modal
        title="Chi tiết lịch khám"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedAppointment(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setDetailModalVisible(false);
              setSelectedAppointment(null);
            }}
          >
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedAppointment && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Mã lịch khám">
              {selectedAppointment._id}
            </Descriptions.Item>

            <Descriptions.Item label="Bệnh nhân">
              {getPatientName(selectedAppointment)}
            </Descriptions.Item>

            <Descriptions.Item label="Số điện thoại">
              {getPatientPhone(selectedAppointment)}
            </Descriptions.Item>

            <Descriptions.Item label="Email tài khoản đặt lịch">
              {getBookingAccountEmail(selectedAppointment)}
            </Descriptions.Item>

            {/* <Descriptions.Item label="Ngày sinh">
              {typeof selectedAppointment.patient === "object" &&
              selectedAppointment.patient?.dateOfBirth
                ? new Date(
                    selectedAppointment.patient.dateOfBirth,
                  ).toLocaleDateString("vi-VN")
                : "---"}
            </Descriptions.Item>

            <Descriptions.Item label="Giới tính">
              {typeof selectedAppointment.patient === "object"
                ? selectedAppointment.patient?.gender === "male"
                  ? "Nam"
                  : selectedAppointment.patient?.gender === "female"
                    ? "Nữ"
                    : "---"
                : "---"}
            </Descriptions.Item> */}

            <Descriptions.Item label="Bác sĩ">
              {typeof selectedAppointment.doctor === "object"
                ? selectedAppointment.doctor?.name ||
                  selectedAppointment.doctor?.fullName ||
                  "---"
                : "---"}
            </Descriptions.Item>

            <Descriptions.Item label="Ngày khám">
              {selectedAppointment.dateTime
                ? new Date(selectedAppointment.dateTime).toLocaleDateString(
                    "vi-VN",
                  )
                : "---"}
            </Descriptions.Item>

            <Descriptions.Item label="Giờ khám">
              {selectedAppointment.time || "---"}
            </Descriptions.Item>

            <Descriptions.Item label="Phòng">
              {selectedAppointment.room?.name || "---"}
            </Descriptions.Item>

            <Descriptions.Item label="Địa điểm">
              {selectedAppointment.location || "---"}
            </Descriptions.Item>

            <Descriptions.Item label="Triệu chứng">
              {selectedAppointment.symptoms || "---"}
            </Descriptions.Item>

            <Descriptions.Item label="Phương thức khám">
              {selectedAppointment.appointmentMethod === "offline"
                ? "Trực tiếp"
                : "Online"}
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái lịch">
              <Tag color={STATUS_MAP[selectedAppointment.status]?.color}>
                {selectedAppointment.status === "PENDING" &&
                isPaid(selectedAppointment)
                  ? "Chờ xác nhận"
                  : selectedAppointment.status === "PENDING"
                    ? "Chờ thanh toán"
                    : STATUS_MAP[selectedAppointment.status]?.text}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Tổng tiền">
              {selectedAppointment.payment?.totalAmount?.toLocaleString(
                "vi-VN",
              ) || 0}{" "}
              VNĐ
            </Descriptions.Item>

            <Descriptions.Item label="Tiền đặt cọc">
              {selectedAppointment.payment?.depositAmount?.toLocaleString(
                "vi-VN",
              ) || 0}{" "}
              VNĐ ({selectedAppointment.payment?.depositRate || 0}%)
            </Descriptions.Item>

            <Descriptions.Item label="Phương thức thanh toán">
              {selectedAppointment.payment?.paymentMethod === "vnpay"
                ? "VNPay"
                : selectedAppointment.payment?.paymentMethod || "---"}
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái thanh toán">
              {(() => {
                const key = String(
                  selectedAppointment.payment?.paymentStatus || "UNPAID",
                ).toUpperCase();
                const paymentStatus = PAYMENT_STATUS_MAP[key] || {
                  text: key,
                  color: "default",
                };
                return (
                  <Tag color={paymentStatus.color}>{paymentStatus.text}</Tag>
                );
              })()}
            </Descriptions.Item>

            {selectedAppointment.payment?.paidAt && (
              <Descriptions.Item label="Thời gian thanh toán">
                {new Date(selectedAppointment.payment.paidAt).toLocaleString(
                  "vi-VN",
                )}
              </Descriptions.Item>
            )}

            {selectedAppointment.payment?.txnRef && (
              <Descriptions.Item label="Mã giao dịch">
                {selectedAppointment.payment.txnRef}
              </Descriptions.Item>
            )}

            {selectedAppointment.payment?.vnpTransactionNo && (
              <Descriptions.Item label="Mã giao dịch VNPay">
                {selectedAppointment.payment.vnpTransactionNo}
              </Descriptions.Item>
            )}

            {selectedAppointment.status === "CANCELED" && (
              <>
                <Descriptions.Item label="Người hủy">
                  {getCancelByText(selectedAppointment.canceledBy)}
                </Descriptions.Item>
                {selectedAppointment.canceledAt && (
                  <Descriptions.Item label="Thời gian hủy">
                    {new Date(selectedAppointment.canceledAt).toLocaleString(
                      "vi-VN",
                    )}
                  </Descriptions.Item>
                )}
                {selectedAppointment.reason && (
                  <Descriptions.Item label="Lý do hủy">
                    {selectedAppointment.reason}
                  </Descriptions.Item>
                )}
              </>
            )}

            {selectedAppointment.createdAt && (
              <Descriptions.Item label="Ngày tạo">
                {new Date(selectedAppointment.createdAt).toLocaleString(
                  "vi-VN",
                )}
              </Descriptions.Item>
            )}

            {selectedAppointment.updatedAt && (
              <Descriptions.Item label="Cập nhật lần cuối">
                {new Date(selectedAppointment.updatedAt).toLocaleString(
                  "vi-VN",
                )}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}

        {detailLoading && <div style={{ marginTop: 12 }}>Đang tải chi tiết...</div>}
      </Modal>

      <Modal
        title="Xác nhận hủy lịch"
        open={cancelConfirmVisible}
        onCancel={handleCloseCancelConfirm}
        onOk={handleConfirmCancelStatus}
        okText="Xác nhận hủy"
        cancelText="Đóng"
        okButtonProps={{ danger: true }}
        confirmLoading={submittingCancel}
      >
        {appointmentToCancel && (
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Bệnh nhân</div>
              <div>{getPatientName(appointmentToCancel)}</div>
            </div>

            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                Lý do hủy từ người dùng
              </div>
              <div>
                {appointmentToCancel.reason?.trim() ||
                  "Chưa có lý do từ người dùng"}
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                Ghi chú hủy của phòng khám
              </div>
              <TextArea
                rows={4}
                maxLength={500}
                showCount
                value={adminCancelNote}
                placeholder="Nhập ghi chú của admin trước khi xác nhận hủy"
                onChange={(e) => setAdminCancelNote(e.target.value)}
              />
            </div>

            {requiresRefundChoice(appointmentToCancel) && (
              <div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                  Chính sách hoàn tiền
                </div>
                <Radio.Group
                  value={cancelOption}
                  onChange={(e) =>
                    setCancelOption(e.target.value as CancelOption)
                  }
                >
                  <Radio value="REFUND">Hủy và hoàn tiền</Radio>
                  <Radio value="NO_REFUND">Hủy không hoàn tiền</Radio>
                </Radio.Group>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default AppointmentManagement;
