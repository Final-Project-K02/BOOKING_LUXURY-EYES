import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  TimePicker,
  message,
  Popconfirm,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";
import api from "../../api";
import type { Doctor } from "../../types/Doctor";



interface TimeSlot {
  date: string;
  time: string;
  status: "AVAILABLE" | "BOOKED";
  capacity: number;
  blockTime: number;
}

interface Schedule {
  _id: string;
  doctorId: string;
  roomId: number;
  roomName: string;
  price: number;
  timeSlots: TimeSlot[];
}

interface FormValues {
  doctorId: string;
  roomId: number;
  roomName: string;
  date?: Dayjs;
  time?: Dayjs;
  blockTime?: number;
}

const ROOMS = Array.from({ length: 11 }, (_, i) => ({
  id: 300 + i,
  name: `Phòng ${300 + i}`,
}));

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [open, setOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [form] = Form.useForm<FormValues>();

  const doctorMap = useMemo<Record<string, Doctor>>(() => {
    const map: Record<string, Doctor> = {};
    doctors.forEach((d) => (map[d._id] = d));
    return map;
  }, [doctors]);

  const fetchDoctors = async () => {
    const res = await api.get<{ data: Doctor[] }>("/doctors");
    setDoctors(res.data.data || []);
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: Schedule[] }>("/schedules");
      setSchedules(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchSchedules();
  }, []);

  const handleDoctorChange = (doctorId: string) => {
    const doctor = doctorMap[doctorId];
    form.setFieldsValue({
      blockTime: undefined,
    });
    if (doctor?.price) {
      form.setFieldsValue({
        roomName: form.getFieldValue("roomName"),
      });
    }
  };

  const addTimeSlot = () => {
    const date = form.getFieldValue("date");
    const time = form.getFieldValue("time");
    const blockTime = form.getFieldValue("blockTime");

    if (!date || !time || !blockTime) {
      message.warning("Nhập đủ ngày, giờ và thời gian khám");
      return;
    }

    const start = dayjs(
      `${date.format("YYYY-MM-DD")} ${time.format("HH:mm")}`
    );
    const end = start.add(blockTime, "minute");

    const duplicated = timeSlots.some((s) => {
      const oldStart = dayjs(
        `${dayjs(s.date).format("YYYY-MM-DD")} ${s.time}`
      );
      const oldEnd = oldStart.add(s.blockTime, "minute");
      return start.isBefore(oldEnd) && end.isAfter(oldStart);
    });

    if (duplicated) {
      message.error("Khung giờ bị trùng với thời gian khám khác");
      return;
    }

    const slot: TimeSlot = {
      date: start.startOf("day").toISOString(),
      time: start.format("HH:mm"),
      status: "AVAILABLE",
      capacity: 1,
      blockTime,
    };

    setTimeSlots((prev) => [...prev, slot]);
  };

  const handleSubmit = async (values: FormValues) => {
    if (!timeSlots.length) {
      message.error("Chưa thêm khung giờ");
      return;
    }

    const doctor = doctorMap[values.doctorId];

    const payload = {
      doctorId: values.doctorId,
      roomId: values.roomId,
      roomName: values.roomName,
      price: Number(doctor?.price ?? 0),
      timeSlots,
    };

    if (editingSchedule) {
      await api.put(`/schedules/${editingSchedule._id}`, payload);
      message.success("Cập nhật lịch thành công");
    } else {
      await api.post("/schedules", payload);
      message.success("Tạo lịch thành công");
    }

    setOpen(false);
    setEditingSchedule(null);
    setTimeSlots([]);
    form.resetFields();
    fetchSchedules();
  };

  const handleDeleteSchedule = async (id: string) => {
    await api.delete(`/schedules/${id}`);
    message.success("Xóa lịch thành công");
    fetchSchedules();
  };

  const columns: ColumnsType<Schedule> = [
    {
      title: "Bác sĩ",
      render: (_, r) => {
        const d = doctorMap[r.doctorId];
        return (
          <Space direction="vertical" size={0}>
            <strong>{d?.name || "—"}</strong>
            <span style={{ fontSize: 12 }}>{d?.specialty || "—"}</span>
          </Space>
        );
      },
    },
    {
      title: "Phòng",
      dataIndex: "roomName",
      render: (v: string) => <Tag color="purple">{v}</Tag>,
    },
    {
      title: "Giá",
      render: (_, r) => (
        <Tag color="blue">
          {r.price.toLocaleString("vi-VN")}đ
        </Tag>
      ),
    },
    {
      title: "Lịch",
      render: (_, r) => (
        <Space wrap>
          {r.timeSlots.map((s, i) => (
            <Tag key={i} color="green">
              {dayjs(s.date).format("DD/MM/YYYY")} – {s.time}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "Thao tác",
      render: (_, r) => (
        <Space>
         <Button
  onClick={() => {
    setEditingSchedule(r);
    setTimeSlots(r.timeSlots);

    form.setFieldsValue({
      doctorId: r.doctorId,
      roomId: r.roomId,
      roomName: r.roomName,
      date: undefined,
      time: undefined,
      blockTime: undefined,
    });

    setOpen(true);
  }}
>
  Sửa
</Button>

          <Popconfirm
            title="Xóa lịch này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDeleteSchedule(r._id)}
          >
            <Button danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Quản lý lịch làm việc bác sĩ"
      extra={
        <Button
          type="primary"
          onClick={() => {
            form.resetFields();
            setTimeSlots([]);
            setEditingSchedule(null);
            setOpen(true);
          }}
        >
          Tạo lịch
        </Button>
      }
    >
      <Table rowKey="_id" loading={loading} columns={columns} dataSource={schedules} />

      <Modal
        open={open}
        title={editingSchedule ? "Sửa lịch" : "Tạo lịch"}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item name="doctorId" label="Bác sĩ" rules={[{ required: true }]}>
            <Select onChange={handleDoctorChange}>
              {doctors.map((d) => (
                <Select.Option key={d._id} value={d._id}>
                  {d.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="roomId" label="Phòng" rules={[{ required: true }]}>
            <Select
              onChange={(id: number) =>
                form.setFieldsValue({
                  roomName: ROOMS.find((r) => r.id === id)?.name || "",
                })
              }
            >
              {ROOMS.map((r) => (
                <Select.Option key={r.id} value={r.id}>
                  {r.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="roomName" hidden>
            <Input />
          </Form.Item>

          <Form.Item name="date" label="Ngày">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="time" label="Giờ">
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="blockTime" label="Thời gian khám (phút)">
            <InputNumber min={10} step={5} style={{ width: "100%" }} />
          </Form.Item>

          <Button onClick={addTimeSlot} block>
            Thêm khung giờ
          </Button>

          <Space wrap style={{ marginTop: 12 }}>
            {timeSlots.map((s, i) => (
              <Tag key={i} color="green">
                {dayjs(s.date).format("DD/MM/YYYY")} – {s.time}
              </Tag>
            ))}
          </Space>
        </Form>
      </Modal>
    </Card>
  );
};

export default ScheduleManagement;
