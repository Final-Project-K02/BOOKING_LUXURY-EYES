import { Button, Card, Popconfirm, Select, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CalendarOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Doctor } from "../../types/Doctor";
import type {
  Schedule,
  TimeSlot,
} from "../../hooks/ScheduleManagement/useScheduleManagement";
import { isBookedLikeStatus } from "../../hooks/ScheduleManagement/useScheduleManagement";

// Group time slots by date for display in the schedule detail column
const groupSlotsByDate = (slots: TimeSlot[]) => {
  const groups: Record<string, string[]> = {};
  slots.forEach((slot) => {
    const dateStr = dayjs(slot.date).format("DD/MM/YYYY");
    if (!groups[dateStr]) groups[dateStr] = [];
    groups[dateStr].push(slot.time);
  });
  return groups;
};

interface Props {
  schedules: Schedule[];
  loading: boolean;
  doctorMap: Record<string, Doctor>;
  scheduleViewMode: "upcoming" | "past";
  getVisibleSlots: (slots: TimeSlot[]) => TimeSlot[];
  onViewModeChange: (mode: "upcoming" | "past") => void;
  onCreateNew: () => void;
  onEdit: (schedule: Schedule) => void;
  onDelete: (id: string) => void;
}

const ScheduleTable = ({
  schedules,
  loading,
  doctorMap,
  scheduleViewMode,
  getVisibleSlots,
  onViewModeChange,
  onCreateNew,
  onEdit,
  onDelete,
}: Props) => {
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
        const hasBooked = r.timeSlots.some((s) => isBookedLikeStatus(s.status));
        return (
          <Space direction="vertical" size={4} style={{ width: "100%" }}>
            <Tag color="purple" style={{ fontSize: 13 }}>
              {r.roomName || `Phòng ${r.roomId}`}
            </Tag>
            {hasBooked && (
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
            {dates.map((dateStr) => (
              <div
                key={dateStr}
                style={{
                  borderLeft: "3px solid #52c41a",
                  background: "#f6ffed",
                  padding: "4px 8px",
                  borderRadius: "0 4px 4px 0",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                  <CalendarOutlined style={{ marginRight: 6 }} />
                  {dateStr}
                </div>
                <Space wrap size={[4, 4]}>
                  {grouped[dateStr].sort().map((time, idx) => (
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
      render: (_, r) => {
        const bookedCount = r.timeSlots.filter((s) =>
          isBookedLikeStatus(s.status),
        ).length;
        const canDelete = bookedCount === 0;

        return (
          <Space direction="vertical">
            <Button
              size="small"
              type="primary"
              ghost
              block
              onClick={() => onEdit(r)}
            >
              Sửa
            </Button>
            <Popconfirm
              title="Xóa toàn bộ lịch?"
              description={
                canDelete
                  ? `Xóa tất cả ${r.timeSlots.length} khung giờ của bác sĩ này?`
                  : `Không thể xóa vì có ${bookedCount} khung giờ đã được đặt`
              }
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              onConfirm={() => onDelete(r._id)}
              disabled={!canDelete}
            >
              <Button
                size="small"
                danger
                block
                disabled={!canDelete}
                title={
                  !canDelete
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

  return (
    <Card
      title="Quản lý lịch làm việc bác sĩ"
      extra={
        <Space>
          <Select
            value={scheduleViewMode}
            style={{ width: 170 }}
            onChange={onViewModeChange}
            options={[
              { value: "upcoming", label: "Lịch từ hôm nay" },
              { value: "past", label: "Lịch đã cũ" },
            ]}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreateNew}>
            Tạo lịch mới
          </Button>
        </Space>
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
    </Card>
  );
};

export default ScheduleTable;
