import { Button, Select, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Appointment, AppointmentStatus } from "../../../types/Booking";
import {
  PAYMENT_STATUS_FLOW,
  PAYMENT_STATUS_MAP,
  STATUS_FLOW,
  STATUS_MAP,
} from "../../../constants/AppointmentManagement/appointmentAdminConstants";
import {
  getCancelByText,
  getPatientName,
  isPaid,
} from "../../../utils/AppointmentManagement/appointmentAdminHelpers";

interface AppointmentTableProps {
  appointments: Appointment[];
  loading: boolean;
  onViewDetail: (record: Appointment) => void;
  onUpdateStatus: (record: Appointment, nextStatus: AppointmentStatus) => void;
  onUpdatePaymentStatus: (
    record: Appointment,
    nextPaymentStatus: string,
  ) => void;
  onReload: () => void;
}

const AppointmentTable = ({
  appointments,
  loading,
  onViewDetail,
  onUpdateStatus,
  onUpdatePaymentStatus,
  onReload,
}: AppointmentTableProps) => {
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
            <Button type="link" onClick={() => onViewDetail(record)}>
              Xem chi tiết
            </Button>

            {allowedStatus.length > 0 && (
              <Select
                placeholder="Đổi trạng thái lịch"
                style={{ width: 180 }}
                onChange={(value) =>
                  onUpdateStatus(record, value as AppointmentStatus)
                }
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
                onChange={(value) =>
                  onUpdatePaymentStatus(record, String(value))
                }
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
      <Button loading={loading} onClick={onReload} style={{ marginBottom: 8 }}>
        Load dữ liệu
      </Button>
      <Table<Appointment>
        rowKey="_id"
        loading={loading}
        columns={columns}
        dataSource={appointments}
      />
    </>
  );
};

export default AppointmentTable;
