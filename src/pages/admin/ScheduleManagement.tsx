import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  message,
  Popconfirm,
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
  roomId?: number;
  roomName?: string;
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
  times?: string[]; // Chọn nhiều giờ cùng lúc
}

const sortTimeSlots = (slots: TimeSlot[]) => {
  return [...slots].sort((a, b) => {
    const timeA = dayjs(`${dayjs(a.date).format("YYYY-MM-DD")} ${a.time}`);
    const timeB = dayjs(`${dayjs(b.date).format("YYYY-MM-DD")} ${b.time}`);
    return timeA.diff(timeB);
  });
};

const ROOMS = Array.from({ length: 11 }, (_, i) => ({
  id: 300 + i,
  name: `Phòng ${300 + i}`,
}));

// Helper function để gom nhóm giờ theo ngày (không phân biệt phòng)
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

const getDateKey = (date: string | Dayjs) => dayjs(date).format("YYYY-MM-DD");
const FIXED_BLOCK_TIME_MINUTES = 30;
const MIN_SLOT_GAP_MINUTES = 30;
const isBookedLikeStatus = (status?: string) => {
  const normalized = String(status || "")
    .trim()
    .toUpperCase();
  return normalized !== "" && normalized !== "AVAILABLE";
};

// Tạo danh sách các khung giờ trong ngày (mỗi 30 phút)
// Giờ làm việc: 7h30-12h00 (sáng), 13h30-17h30 (chiều)
const generateTimeOptions = () => {
  const options: { value: string; label: string }[] = [];

  // Ca sáng: 07:30 - 11:30
  for (let h = 7; h <= 11; h++) {
    const startMin = h === 7 ? 30 : 0; // Bắt đầu từ 7:30
    for (let m = startMin; m < 60; m += 30) {
      const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      options.push({ value: timeStr, label: timeStr });
    }
  }

  // Ca chiều: 13:30 - 17:30
  for (let h = 13; h <= 17; h++) {
    const startMin = h === 13 ? 30 : 0; // Bắt đầu từ 13:30
    const endMin = h === 17 ? 30 : 60; // Kết thúc ở 17:30
    for (let m = startMin; m < endMin; m += 30) {
      const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      options.push({ value: timeStr, label: timeStr });
    }
  }

  return options;
};

const TIME_OPTIONS = generateTimeOptions();

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [open, setOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [scheduleViewMode, setScheduleViewMode] = useState<"upcoming" | "past">(
    "upcoming",
  );

  // State quản lý danh sách slot đang thêm/sửa
  const [tempTimeSlots, setTempTimeSlots] = useState<TimeSlot[]>([]);
  const [form] = Form.useForm<FormValues>();
  const selectedDoctorId = Form.useWatch("doctorId", form);
  const selectedDate = Form.useWatch("date", form);

  const doctorMap = useMemo<Record<string, Doctor>>(() => {
    const map: Record<string, Doctor> = {};
    doctors.forEach((d) => (map[d._id] = d));
    return map;
  }, [doctors]);

  const todayStart = useMemo(() => dayjs().startOf("day"), []);

  const doctorsWithSchedule = useMemo(() => {
    return new Set(schedules.map((schedule) => schedule.doctorId));
  }, [schedules]);

  const doctorAssignedRoomMap = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    schedules.forEach((schedule) => {
      if (!map[schedule.doctorId]) {
        map[schedule.doctorId] = schedule.roomId;
      }
    });
    return map;
  }, [schedules]);

  const roomAssignedDoctorMap = useMemo<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    schedules.forEach((schedule) => {
      // Ưu tiên dữ liệu room ở root schedule, fallback theo slot để tương thích dữ liệu cũ
      if (!map[schedule.roomId]) {
        map[schedule.roomId] = schedule.doctorId;
      }

      schedule.timeSlots.forEach((slot) => {
        if (slot.roomId && !map[slot.roomId]) {
          map[slot.roomId] = schedule.doctorId;
        }
      });
    });
    return map;
  }, [schedules]);

  const roomOptions = useMemo(() => {
    return ROOMS.map((room) => {
      const assignedDoctorId = roomAssignedDoctorMap[room.id];
      const disabled =
        !!assignedDoctorId &&
        !!selectedDoctorId &&
        assignedDoctorId !== selectedDoctorId;

      return {
        ...room,
        disabled,
      };
    });
  }, [roomAssignedDoctorMap, selectedDoctorId]);

  // Tính toán các khung giờ có thể chọn (disable những giờ đã có trong ngày)
  const availableTimeOptions = useMemo(() => {
    if (!selectedDate || !selectedDoctorId) {
      return TIME_OPTIONS;
    }

    const dateKey = selectedDate.format("YYYY-MM-DD");

    // Lấy các khung giờ đã có của bác sĩ trong ngày đó
    const usedTimes = new Set(
      tempTimeSlots
        .filter((slot) => getDateKey(slot.date) === dateKey)
        .map((slot) => slot.time),
    );

    // Disable các option đã được sử dụng
    return TIME_OPTIONS.map((opt) => ({
      ...opt,
      disabled: usedTimes.has(opt.value),
    }));
  }, [selectedDate, selectedDoctorId, tempTimeSlots]);

  const getVisibleSlots = (slots: TimeSlot[]) => {
    return slots.filter((slot) => {
      const slotDay = dayjs(slot.date).startOf("day");
      return scheduleViewMode === "upcoming"
        ? slotDay.isSame(todayStart) || slotDay.isAfter(todayStart)
        : slotDay.isBefore(todayStart);
    });
  };

  const displaySchedules = useMemo(() => {
    return schedules.filter(
      (schedule) => getVisibleSlots(schedule.timeSlots).length > 0,
    );
  }, [schedules, scheduleViewMode, todayStart]);

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

  const disabledDate = (current: Dayjs) => {
    return current && current.isBefore(dayjs().add(1, "day").startOf("day"));
  };

  const handleDoctorChange = (doctorId: string) => {
    const assignedRoomId = doctorAssignedRoomMap[doctorId];
    const assignedRoomName = ROOMS.find((r) => r.id === assignedRoomId)?.name;

    if (assignedRoomId) {
      form.setFieldsValue({
        roomId: assignedRoomId,
        roomName: assignedRoomName,
      });
    }
  };

  const addTimeSlot = () => {
    const date = form.getFieldValue("date");
    const times = form.getFieldValue("times"); // Array of time strings
    const roomId = form.getFieldValue("roomId");
    const roomName = form.getFieldValue("roomName");

    if (!roomId) {
      message.warning("Vui lòng chọn phòng trước khi thêm khung giờ!");
      return;
    }

    if (!date) {
      message.warning("Vui lòng chọn ngày!");
      return;
    }

    if (!times || times.length === 0) {
      message.warning("Vui lòng chọn ít nhất 1 khung giờ!");
      return;
    }

    const dateKey = date.format("YYYY-MM-DD");
    const newSlots: TimeSlot[] = [];
    const conflicts: string[] = [];

    // Tạo slot cho mỗi giờ đã chọn
    for (const timeStr of times) {
      const slotTime = dayjs(`${dateKey} ${timeStr}`);

      // Check xung đột với tempTimeSlots hiện tại
      const tooClose = tempTimeSlots.some((s) => {
        if (getDateKey(s.date) !== dateKey) return false;
        const oldStart = dayjs(
          `${dayjs(s.date).format("YYYY-MM-DD")} ${s.time}`,
        );
        return (
          Math.abs(slotTime.diff(oldStart, "minute")) < MIN_SLOT_GAP_MINUTES
        );
      });

      if (tooClose) {
        conflicts.push(timeStr);
        continue;
      }

      newSlots.push({
        date: slotTime.startOf("day").toISOString(),
        time: timeStr,
        status: "AVAILABLE",
        capacity: 1,
        blockTime: FIXED_BLOCK_TIME_MINUTES,
        roomId,
        roomName,
      });
    }

    if (newSlots.length === 0) {
      message.error(
        conflicts.length > 0
          ? `Tất cả khung giờ đã chọn đều bị xung đột: ${conflicts.join(", ")}`
          : "Không thể thêm khung giờ nào. Vui lòng kiểm tra lại.",
      );
      return;
    }

    setTempTimeSlots((prev) => sortTimeSlots([...prev, ...newSlots]));

    if (conflicts.length > 0) {
      message.warning(
        `Đã thêm ${newSlots.length} khung giờ. Bỏ qua ${conflicts.length} khung giờ bị xung đột: ${conflicts.join(", ")}`,
      );
    } else {
      message.success(`Đã thêm ${newSlots.length} khung giờ`);
    }

    // Clear times để tiếp tục chọn, giữ lại date
    form.setFieldsValue({
      times: undefined,
    });
  };

  const removeTempSlot = (index: number) => {
    const slot = tempTimeSlots[index];
    if (slot && isBookedLikeStatus(slot.status)) {
      message.warning("Không thể xóa slot đã được đặt");
      return;
    }

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

    // Đếm số slot đã được đặt
    const bookedSlotsCount = tempTimeSlots.filter((slot) =>
      isBookedLikeStatus(slot.status),
    ).length;

    if (bookedSlotsCount > 0 && editingSchedule) {
      message.warning(
        `Lưu ý: Có ${bookedSlotsCount} khung giờ đã được đặt. Hãy cẩn thận khi xóa!`,
      );
    }

    // Chỉ validate phòng khi tạo mới hoặc khi đổi phòng trong edit
    const isChangingRoom =
      editingSchedule && editingSchedule.roomId !== values.roomId;

    if (!editingSchedule || isChangingRoom) {
      const roomUsedByAnotherDoctor = schedules.some((schedule) => {
        if (editingSchedule && schedule._id === editingSchedule._id)
          return false;

        if (schedule.doctorId === values.doctorId) return false;

        if (schedule.roomId === values.roomId) return true;

        return schedule.timeSlots.some((slot) => slot.roomId === values.roomId);
      });

      if (roomUsedByAnotherDoctor) {
        message.error(
          "Phòng này đã được gán cho bác sĩ khác. Vui lòng chọn phòng trống.",
        );
        return;
      }
    }

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
        // Bác sĩ đã có lịch thì chỉ cho phép vào luồng Sửa để thêm slot mới
        const existingSchedule = schedules.find(
          (schedule) => schedule.doctorId === values.doctorId,
        );

        if (existingSchedule) {
          message.warning(
            "Bác sĩ này đã có lịch. Vui lòng bấm 'Sửa' ở danh sách để thêm lịch tiếp theo.",
          );
          return;
        } else {
          await api.post("/schedules", payload);
          message.success("Tạo lịch thành công");
        }
      }

      setOpen(false);
      setEditingSchedule(null);
      setTempTimeSlots([]);
      form.resetFields();
      fetchSchedules();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || "Có lỗi xảy ra khi lưu lịch!";
      message.error(errorMsg);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      await api.delete(`/schedules/${id}`);
      message.success("Xóa lịch thành công");
      fetchSchedules();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        "Xóa thất bại. Có thể lịch này đã có người đặt.";
      message.error(errorMsg);
    }
  };

  // Cấu hình bảng hiển thị chính
  const columns: ColumnsType<Schedule> = [
    {
      title: "Bác sĩ",
      width: 180,
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
      title: "Phòng khám",
      width: 120,
      align: "center",
      render: (_, r) => {
        const hasBookedSlots = r.timeSlots.some((s) =>
          isBookedLikeStatus(s.status),
        );
        return (
          <Space direction="vertical" size={4} style={{ width: "100%" }}>
            <Tag color="purple" style={{ fontSize: 13 }}>
              {r.roomName || `Phòng ${r.roomId}`}
            </Tag>
            {hasBookedSlots && (
              <Tag color="red" style={{ fontSize: 11 }}>
                Có lịch đặt
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Chi tiết Lịch làm việc",
      render: (_, r) => {
        const visibleSlots = getVisibleSlots(r.timeSlots);
        const grouped = groupSlotsByDate(visibleSlots);
        const dates = Object.keys(grouped).sort((a, b) =>
          dayjs(a, "DD/MM/YYYY").diff(dayjs(b, "DD/MM/YYYY")),
        );

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {dates.map((dateStr) => {
              const times = grouped[dateStr];
              return (
                <div
                  key={dateStr}
                  style={{
                    borderLeft: "3px solid #52c41a",
                    paddingLeft: 8,
                    background: "#f6ffed",
                    padding: "4px 8px",
                    borderRadius: "0 4px 4px 0",
                  }}
                >
                  <div
                    style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}
                  >
                    <CalendarOutlined style={{ marginRight: 6 }} />
                    {dateStr}
                  </div>
                  <Space wrap size={[4, 4]}>
                    {times.sort().map((time, idx) => (
                      <Tag key={idx} color="default" style={{ margin: 0 }}>
                        {time}
                      </Tag>
                    ))}
                  </Space>
                </div>
              );
            })}
          </div>
        );
      },
    },
    {
      title: "Thao tác",
      width: 120,
      align: "center",
      render: (_, r) => {
        const hasBookedSlots = r.timeSlots.some((s) =>
          isBookedLikeStatus(s.status),
        );
        const shouldDisableDelete = hasBookedSlots;
        const bookedCount = r.timeSlots.filter((s) =>
          isBookedLikeStatus(s.status),
        ).length;

        return (
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
                  times: undefined,
                });

                setOpen(true);
              }}
            >
              Sửa
            </Button>

            <Popconfirm
              title="Xóa toàn bộ lịch?"
              description={
                shouldDisableDelete
                  ? `Không thể xóa vì có ${bookedCount} khung giờ đã được đặt`
                  : `Xóa tất cả ${r.timeSlots.length} khung giờ của bác sĩ này?`
              }
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDeleteSchedule(r._id)}
              disabled={shouldDisableDelete}
            >
              <Button
                size="small"
                danger
                block
                disabled={shouldDisableDelete}
                title={
                  shouldDisableDelete
                    ? `Không thể xóa vì có ${bookedCount} slot đã được đặt`
                    : "Xóa toàn bộ lịch"
                }
              >
                Xóa toàn bộ
              </Button>
            </Popconfirm>
          </Space>
        );
      },
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
      title: "Trạng thái",
      dataIndex: "status",
      width: 100,
      render: (status) => (
        <Tag color={isBookedLikeStatus(status) ? "red" : "green"}>
          {isBookedLikeStatus(status) ? "Đã đặt" : "Trống"}
        </Tag>
      ),
    },
    {
      title: "Thời lượng",
      dataIndex: "blockTime",
      render: (val) => `${val} phút`,
    },
    {
      title: "",
      width: 50,
      render: (_, slot, index) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeTempSlot(index)}
          disabled={isBookedLikeStatus(slot.status)}
          title={
            isBookedLikeStatus(slot.status)
              ? "Không thể xóa slot đã được đặt"
              : "Xóa slot này"
          }
        />
      ),
    },
  ];

  return (
    <Card
      title="Quản lý lịch làm việc bác sĩ"
      extra={
        <Space>
          <Select
            value={scheduleViewMode}
            style={{ width: 170 }}
            onChange={(value: "upcoming" | "past") =>
              setScheduleViewMode(value)
            }
            options={[
              { value: "upcoming", label: "Lịch từ hôm nay" },
              { value: "past", label: "Lịch đã cũ" },
            ]}
          />

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
        </Space>
      }
    >
      <Table
        rowKey="_id"
        loading={loading}
        columns={columns}
        dataSource={displaySchedules}
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
          <Space style={{ display: "flex", width: "100%" }} align="start">
            <Form.Item
              name="doctorId"
              label="Bác sĩ"
              style={{ flex: 1 }}
              rules={[{ required: true, message: "Chọn bác sĩ" }]}
            >
              <Select onChange={handleDoctorChange} placeholder="Chọn bác sĩ">
                {doctors.map((d) => (
                  <Select.Option
                    key={d._id}
                    value={d._id}
                    disabled={
                      !editingSchedule && doctorsWithSchedule.has(d._id)
                    }
                  >
                    {d.name}
                    {!editingSchedule && doctorsWithSchedule.has(d._id)
                      ? " (đã có lịch)"
                      : ""}
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
                {roomOptions.map((r) => (
                  <Select.Option key={r.id} value={r.id} disabled={r.disabled}>
                    {r.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Space>

          <Form.Item name="roomName" hidden>
            <Input />
          </Form.Item>

          {/* Cảnh báo khi có slot đã được đặt */}
          {editingSchedule &&
            tempTimeSlots.some((s) => isBookedLikeStatus(s.status)) && (
              <div
                style={{
                  background: "#fff7e6",
                  border: "1px solid #ffd591",
                  padding: "12px 16px",
                  borderRadius: 4,
                  marginBottom: 16,
                  fontSize: 13,
                }}
              >
                ⚠️ <strong>Lưu ý:</strong> Có{" "}
                {
                  tempTimeSlots.filter((s) => isBookedLikeStatus(s.status))
                    .length
                }{" "}
                khung giờ đã được đặt. Không thể xóa các slot này hoặc xóa toàn
                bộ lịch.
              </div>
            )}

          {/* Khu vực thêm giờ */}
          <Card
            size="small"
            title="Thêm khung giờ"
            style={{ background: "#f5f5f5", marginBottom: 16 }}
          >
            <Space style={{ display: "flex", width: "100%" }} align="start">
              <Form.Item
                name="date"
                label="Ngày"
                style={{ flex: 1, marginBottom: 0 }}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                  disabledDate={disabledDate}
                  placeholder="Chọn ngày"
                />
              </Form.Item>

              <Form.Item
                name="times"
                label="Khung giờ (chọn nhiều)"
                style={{ flex: 3, marginBottom: 0 }}
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn nhiều khung giờ cùng lúc"
                  options={availableTimeOptions}
                  style={{ width: "100%" }}
                  optionFilterProp="label"
                  maxTagCount="responsive"
                  showSearch
                />
              </Form.Item>

              <div style={{ marginTop: 30 }}>
                <Button
                  type="primary"
                  onClick={addTimeSlot}
                  icon={<PlusOutlined />}
                >
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
