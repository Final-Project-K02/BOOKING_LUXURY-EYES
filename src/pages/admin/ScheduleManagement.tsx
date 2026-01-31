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
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DeleteOutlined,
  CalendarOutlined,
  PlusOutlined,
} from "@ant-design/icons";
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

// Helper function để gom nhóm giờ theo ngày
const groupSlotsByDate = (slots: TimeSlot[]) => {
  const groups: Record<string, string[]> = {};
  slots.forEach((slot) => {
    const dateStr = dayjs(slot.date).format("DD/MM/YYYY");
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(slot.time);
  });
  return groups;
};

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [open, setOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(false);
  
  // State quản lý danh sách slot đang thêm/sửa
  const [tempTimeSlots, setTempTimeSlots] = useState<TimeSlot[]>([]);
  const [form] = Form.useForm<FormValues>();

  const doctorMap = useMemo<Record<string, Doctor>>(() => {
    const map: Record<string, Doctor> = {};
    doctors.forEach((d) => (map[d._id] = d));
    return map;
  }, [doctors]);

  const fetchDoctors = async () => {
    try {
      const res = await api.get<{ data: Doctor[] }>("/doctors");
      setDoctors(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: Schedule[] }>("/schedules");
      setSchedules(res.data.data || []);
    } catch (error) {
      console.error(error);
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
    // Giữ nguyên logic cũ nếu cần update field nào đó
  };

  const addTimeSlot = () => {
    const date = form.getFieldValue("date");
    const time = form.getFieldValue("time");
    const blockTime = form.getFieldValue("blockTime");

    if (!date || !time || !blockTime) {
      message.warning("Vui lòng nhập đủ Ngày, Giờ và Thời gian khám!");
      return;
    }

    const start = dayjs(
      `${date.format("YYYY-MM-DD")} ${time.format("HH:mm")}`
    );
    const end = start.add(blockTime, "minute");

    // Check trùng giờ trong danh sách đang thêm
    const duplicated = tempTimeSlots.some((s) => {
      const oldStart = dayjs(`${dayjs(s.date).format("YYYY-MM-DD")} ${s.time}`);
      const oldEnd = oldStart.add(s.blockTime, "minute");
      // Logic trùng lặp đơn giản: start mới < end cũ && end mới > start cũ
      return start.isBefore(oldEnd) && end.isAfter(oldStart);
    });

    if (duplicated) {
      message.error("Khung giờ bị trùng với thời gian đã chọn!");
      return;
    }

    const slot: TimeSlot = {
      date: start.startOf("day").toISOString(),
      time: start.format("HH:mm"),
      status: "AVAILABLE",
      capacity: 1,
      blockTime,
    };

    // Thêm vào danh sách tạm và sắp xếp lại theo thời gian
    setTempTimeSlots((prev) => {
      const newList = [...prev, slot];
      return newList.sort((a, b) => {
        const timeA = dayjs(`${dayjs(a.date).format("YYYY-MM-DD")} ${a.time}`);
        const timeB = dayjs(`${dayjs(b.date).format("YYYY-MM-DD")} ${b.time}`);
        return timeA.diff(timeB);
      });
    });
    
    message.success("Đã thêm khung giờ");
  };

  const removeTempSlot = (index: number) => {
    const newList = [...tempTimeSlots];
    newList.splice(index, 1);
    setTempTimeSlots(newList);
  };

  const handleSubmit = async (values: FormValues) => {
    if (!tempTimeSlots.length) {
      message.error("Chưa có khung giờ nào được thêm!");
      return;
    }

    const doctor = doctorMap[values.doctorId];

    const payload = {
      doctorId: values.doctorId,
      roomId: values.roomId,
      roomName: values.roomName,
      price: Number(doctor?.price ?? 0),
      timeSlots: tempTimeSlots,
    };

    try {
      if (editingSchedule) {
        await api.put(`/schedules/${editingSchedule._id}`, payload);
        message.success("Cập nhật lịch thành công");
      } else {
        await api.post("/schedules", payload);
        message.success("Tạo lịch thành công");
      }

      setOpen(false);
      setEditingSchedule(null);
      setTempTimeSlots([]);
      form.resetFields();
      fetchSchedules();
    } catch (error) {
      message.error("Có lỗi xảy ra khi lưu lịch!");
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      await api.delete(`/schedules/${id}`);
      message.success("Xóa lịch thành công");
      fetchSchedules();
    } catch (error) {
      message.error("Xóa thất bại");
    }
  };

  // Cấu hình bảng hiển thị chính
  const columns: ColumnsType<Schedule> = [
    {
      title: "Bác sĩ",
      width: 200,
      render: (_, r) => {
        const d = doctorMap[r.doctorId];
        return (
          <Space direction="vertical" size={0}>
            <strong style={{ color: "#1677ff" }}>{d?.name || "—"}</strong>
            <span style={{ fontSize: 12, color: "#888" }}>
              {d?.specialty || "—"}
            </span>
          </Space>
        );
      },
    },
    {
      title: "Thông tin phòng",
      width: 150,
      render: (_, r) => (
        <Space direction="vertical" size={2}>
          <Tag color="purple">{r.roomName}</Tag>
          <Tag color="blue">{r.price.toLocaleString("vi-VN")} đ</Tag>
        </Space>
      ),
    },
    {
      title: "Chi tiết Lịch làm việc",
      render: (_, r) => {
        const grouped = groupSlotsByDate(r.timeSlots);
        const dates = Object.keys(grouped).sort((a, b) =>
          dayjs(a, "DD/MM/YYYY").diff(dayjs(b, "DD/MM/YYYY"))
        );

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {dates.map((date) => (
              <div
                key={date}
                style={{
                  borderLeft: "3px solid #52c41a",
                  paddingLeft: 8,
                  background: "#f6ffed",
                  padding: "4px 8px",
                  borderRadius: "0 4px 4px 0",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                  <CalendarOutlined style={{ marginRight: 6 }} />
                  {date}
                </div>
                <Space wrap size={[4, 4]}>
                  {grouped[date].sort().map((time, idx) => (
                    <Tag key={idx} color="default" style={{ margin: 0 }}>
                      {time}
                    </Tag>
                  ))}
                </Space>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: "Thao tác",
      width: 120,
      align: "center",
      render: (_, r) => (
        <Space direction="vertical">
          <Button
            size="small"
            type="primary"
            ghost
            block
            onClick={() => {
              setEditingSchedule(r);
              setTempTimeSlots(r.timeSlots); // Load lại slots cũ vào state tạm

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
            <Button size="small" danger block>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Cấu hình bảng nhỏ bên trong Modal (để xem/xóa slot tạm)
  const modalTableColumns: ColumnsType<TimeSlot> = [
    {
      title: "Ngày",
      dataIndex: "date",
      render: (val) => dayjs(val).format("DD/MM/YYYY"),
    },
    {
      title: "Giờ",
      dataIndex: "time",
      render: (val) => <Tag color="blue">{val}</Tag>,
    },
    {
      title: "Thời lượng",
      dataIndex: "blockTime",
      render: (val) => `${val} phút`,
    },
    {
      title: "",
      width: 50,
      render: (_, __, index) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeTempSlot(index)}
        />
      ),
    },
  ];

  return (
    <Card
      title="Quản lý lịch làm việc bác sĩ"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields();
            setTempTimeSlots([]);
            setEditingSchedule(null);
            setOpen(true);
          }}
        >
          Tạo lịch mới
        </Button>
      }
    >
      <Table
        rowKey="_id"
        loading={loading}
        columns={columns}
        dataSource={schedules}
        pagination={{ pageSize: 5 }}
        bordered
      />

      <Modal
        open={open}
        title={editingSchedule ? "Sửa lịch làm việc" : "Tạo lịch làm việc"}
        width={700}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
        maskClosable={false}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          {/* Hàng 1: Chọn Bác sĩ & Phòng */}
          <Space style={{ display: 'flex', width: '100%' }} align="start">
             <Form.Item
              name="doctorId"
              label="Bác sĩ"
              style={{ flex: 1 }}
              rules={[{ required: true, message: "Chọn bác sĩ" }]}
            >
              <Select onChange={handleDoctorChange} placeholder="Chọn bác sĩ">
                {doctors.map((d) => (
                  <Select.Option key={d._id} value={d._id}>
                    {d.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="roomId"
              label="Phòng khám"
              style={{ flex: 1 }}
              rules={[{ required: true, message: "Chọn phòng" }]}
            >
              <Select
                placeholder="Chọn phòng"
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
          </Space>

          <Form.Item name="roomName" hidden>
            <Input />
          </Form.Item>
          
          {/* Khu vực thêm giờ */}
          <Card 
            size="small" 
            title="Thêm khung giờ" 
            style={{ background: "#f5f5f5", marginBottom: 16 }}
          >
            <Space style={{ display: 'flex', width: '100%' }} align="start">
              <Form.Item name="date" label="Ngày" style={{ flex: 2, marginBottom: 0 }}>
                <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item name="time" label="Giờ bắt đầu" style={{ flex: 1, marginBottom: 0 }}>
                <TimePicker format="HH:mm" minuteStep={15} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item name="blockTime" label="Phút/Ca" style={{ flex: 1, marginBottom: 0 }}>
                <InputNumber min={10} step={5} style={{ width: "100%" }} placeholder="Ví dụ: 30" />
              </Form.Item>

              <div style={{ marginTop: 30 }}>
                <Button type="primary" onClick={addTimeSlot} icon={<PlusOutlined />}>
                  Thêm
                </Button>
              </div>
            </Space>
          </Card>

          {/* Danh sách các slot đã thêm */}
          <div style={{ marginTop: 12 }}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>
              Danh sách khung giờ dự kiến ({tempTimeSlots.length}):
            </div>
            <Table
              size="small"
              rowKey={(r) => r.date + r.time} // Key tạm
              columns={modalTableColumns}
              dataSource={tempTimeSlots}
              pagination={{ pageSize: 5 }}
              scroll={{ y: 240 }} // Scroll nếu danh sách dài
              locale={{ emptyText: "Chưa có khung giờ nào" }}
            />
          </div>
        </Form>
      </Modal>
    </Card>
  );
};

export default ScheduleManagement;