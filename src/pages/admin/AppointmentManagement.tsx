import { Select, Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import api from "../../api";
import type { Appointment } from "../../types/Booking";
import type { AppointmentStatus } from "../client/AppointmentHistoryPage";

/* ================== STATUS MAP ================== */

const STATUS_MAP: Record<AppointmentStatus, { text: string; color: string }> = {
  PENDING: { text: "Chờ xác nhận", color: "orange" },
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
  CHECKIN: ["DONE"],
  DONE: [],
  CANCELED: [],
  "REQUEST-CANCELED": ["CANCELED"],
};


const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      message.success("Cập nhật trạng thái thành công");
      fetchAppointments();
    } catch {
      message.error("Cập nhật thất bại");
    }
  };

  /* ================== TABLE COLUMNS ================== */

  const columns: ColumnsType<Appointment> = [
    {
      title: "Bệnh nhân",
      render: (_, record) => record.patient?.fullName ?? "---",
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
        const paid = record.payment?.paymentStatus === "PAID";
        return (
          <Tag color={paid ? "green" : "red"}>
            {record.payment?.paymentStatus ?? "UNPAID"}
          </Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: AppointmentStatus) => {
        const s = STATUS_MAP[status];
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: "Thao tác",
      render: (_, record) => {
        const allowedStatus = STATUS_FLOW[record.status];

        if (!allowedStatus || allowedStatus.length === 0) return null;

        return (
          <Select
            placeholder="Đổi trạng thái"
            style={{ width: 180 }}
            onChange={(value) => {
              if (!record._id) {
                message.error("Không tìm thấy ID lịch hẹn");
                return;
              }
              updateStatus(record._id, value as AppointmentStatus);
            }}
            options={allowedStatus.map((status) => ({
              value: status,
              label: STATUS_MAP[status].text,
            }))}
          />
        );
      },
    },
  ];

  return (
    <Table<Appointment>
      rowKey="_id"
      loading={loading}
      columns={columns}
      dataSource={appointments}
    />
  );
};

export default AppointmentManagement;
