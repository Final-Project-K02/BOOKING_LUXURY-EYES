import {
  Button,
  Descriptions,
  Input,
  Modal,
  Select,
  Table,
  Tag,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import api from "../../api";
import type { Appointment } from "../../types/Booking";
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

const PAYMENT_STATUS_MAP: Record<string, { text: string; color: string }> = {
  PAID: { text: "Đã thanh toán", color: "green" },
  PENDING: { text: "Đang chờ thanh toán", color: "orange" },
  REFUND_PENDING: { text: "Đang chờ hoàn tiền", color: "gold" },
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

  if (userReason && clinicReason) {
    return `${userReason}\n${clinicReason}`;
  }

  if (clinicReason) {
    return `${clinicReason}`;
  }

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
  if (typeof record.patient === "object" && record.patient?.fullName) {
    return record.patient.fullName;
  }
  if (record.patientProfile?.fullName) {
    return record.patientProfile.fullName;
  }
  return "---";
};

const AppointmentManagement = () => {
  const { TextArea } = Input;
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [cancelConfirmVisible, setCancelConfirmVisible] =
    useState<boolean>(false);
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<Appointment | null>(null);
  const [adminCancelNote, setAdminCancelNote] = useState<string>("");
  const [submittingCancel, setSubmittingCancel] = useState<boolean>(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: Appointment[] }>("/appointments");
      setAppointments(res.data.data ?? []);
    } catch {
      message.error("Không thể tải lịch hẹn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (
    id: string,
    status: AppointmentStatus,
    reason?: string,
  ) => {
    try {
      await api.patch(`/appointments/${id}`, {
        status,
        ...(reason ? { reason } : {}),
      });
      message.success("Cập nhật trạng thái thành công");
      fetchAppointments();
    } catch {
      message.error("Cập nhật thất bại");
    }
  };

  const updatePaymentStatus = async (id: string, paymentStatus: string) => {
    try {
      await api.patch(`/appointments/${id}`, { paymentStatus });
      message.success("Cập nhật trạng thái hoàn tiền thành công");
      fetchAppointments();
    } catch {
      message.error("Cập nhật trạng thái hoàn tiền thất bại");
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

    try {
      setSubmittingCancel(true);
      await updateStatus(
        appointmentToCancel._id,
        "CANCELED",
        buildCanceledReason(appointmentToCancel, adminCancelNote),
      );
      handleCloseCancelConfirm();
    } finally {
      setSubmittingCancel(false);
    }
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
                setSelectedAppointment(record);
                setDetailModalVisible(true);
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
              {typeof selectedAppointment.patient === "object"
                ? selectedAppointment.patient?.phone
                : selectedAppointment.patientProfile?.phone || "---"}
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
          </div>
        )}
      </Modal>
    </>
  );
};

export default AppointmentManagement;
