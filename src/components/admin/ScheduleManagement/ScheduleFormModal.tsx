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
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import type { FormInstance } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import type { Doctor } from "../../../types/Doctor";
import type {
  Schedule,
  TimeSlot,
  FormValues,
} from "../../../hooks/admin/useScheduleManagement";
import {
  ROOMS,
  isBookedLikeStatus,
} from "../../../hooks/admin/useScheduleManagement";

interface Props {
  open: boolean;
  editingSchedule: Schedule | null;
  tempTimeSlots: TimeSlot[];
  form: FormInstance<FormValues>;
  doctors: Doctor[];
  doctorsWithSchedule: Set<string>;
  roomOptions: Array<{ id: number; name: string; disabled: boolean }>;
  availableTimeOptions: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  disabledDate: (current: Dayjs) => boolean;
  onClose: () => void;
  onDoctorChange: (doctorId: string) => void;
  onAddTimeSlot: () => void;
  onRemoveSlot: (key: string) => void;
  onSubmit: (values: FormValues) => Promise<void>;
}

const ScheduleFormModal = ({
  open,
  editingSchedule,
  tempTimeSlots,
  form,
  doctors,
  doctorsWithSchedule,
  roomOptions,
  availableTimeOptions,
  disabledDate,
  onClose,
  onDoctorChange,
  onAddTimeSlot,
  onRemoveSlot,
  onSubmit,
}: Props) => {
  const bookedCount = tempTimeSlots.filter((s) =>
    isBookedLikeStatus(s.status),
  ).length;

  // Cấu hình bảng danh sách slot tạm bên trong modal
  const slotTableColumns: ColumnsType<TimeSlot> = [
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
      render: (_, slot) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onRemoveSlot(slot.date + slot.time)}
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
    <Modal
      open={open}
      title={editingSchedule ? "Sửa lịch làm việc" : "Tạo lịch làm việc"}
      width={700}
      onCancel={onClose}
      onOk={() => form.submit()}
      destroyOnClose
      maskClosable={false}
    >
      <Form layout="vertical" form={form} onFinish={onSubmit}>
        {/* Hàng 1: Chọn Bác sĩ & Phòng */}
        <Space style={{ display: "flex", width: "100%" }} align="start">
          <Form.Item
            name="doctorId"
            label="Bác sĩ"
            style={{ flex: 1 }}
            rules={[{ required: true, message: "Chọn bác sĩ" }]}
          >
            <Select
              onChange={onDoctorChange}
              placeholder="Chọn bác sĩ"
              disabled={!!editingSchedule}
            >
              {doctors.map((d) => (
                <Select.Option
                  key={d._id}
                  value={d._id}
                  disabled={!editingSchedule && doctorsWithSchedule.has(d._id)}
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
        {editingSchedule && bookedCount > 0 && (
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
            ⚠️ <strong>Lưu ý:</strong> Có {bookedCount} khung giờ đã được đặt.
            Không thể xóa các slot này hoặc xóa toàn bộ lịch.
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
                onClick={onAddTimeSlot}
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
            rowKey={(r) => r.date + r.time}
            columns={slotTableColumns}
            dataSource={tempTimeSlots}
            pagination={{ pageSize: 5 }}
            scroll={{ y: 240 }}
            locale={{ emptyText: "Chưa có khung giờ nào" }}
          />
        </div>
      </Form>
    </Modal>
  );
};

export default ScheduleFormModal;
