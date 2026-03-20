import { EnvironmentOutlined, HomeOutlined } from "@ant-design/icons";
import { Avatar, Button, Card } from "antd";
import type { Doctor } from "../../types/Doctor";
import type {
  DoctorSchedule,
  SelectedSchedule,
  TimeSlot,
  TimeSlotUI,
} from "../../types/Schedule";
import TimeSlotPicker from "./TimeSlotPicker";

interface DoctorScheduleViewProps {
  selectedDoctor: Doctor;
  scheduleItem: DoctorSchedule | null;
  slotsWithState: TimeSlotUI[];
  selectedDate: number | null;
  setSelectedDate: (idx: number) => void;
  selectedSlot: TimeSlot | null;
  onTimeSelect: (slot: TimeSlot) => void;
  onBackToList: () => void;
}

const formatPrice = (value: number) => value.toLocaleString("vi-VN");

/**
 * Hiển thị thông tin bác sĩ đang chọn, thông tin phòng khám,
 * và bộ chọn khung giờ.
 */
const DoctorScheduleView = ({
  selectedDoctor,
  scheduleItem,
  slotsWithState,
  selectedDate,
  setSelectedDate,
  selectedSlot,
  onTimeSelect,
  onBackToList,
}: DoctorScheduleViewProps) => {
  return (
    <div>
      {/* Thông tin bác sĩ */}
      <Card className="mb-4 bg-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar size={56} src={selectedDoctor.avatar} className="shadow" />
            <div>
              <h3 className="font-semibold text-gray-800">
                {selectedDoctor.name}
              </h3>
              <p className="text-sm text-blue-600">
                Kinh nghiệm: {selectedDoctor.experience_year} năm
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-500">Giá khám:</p>
              <p className="text-lg font-bold text-orange-500">
                {formatPrice(Number(selectedDoctor.price) || 0)} đ
              </p>
            </div>
            <Button type="primary" size="large" onClick={onBackToList}>
              Ẩn lịch
            </Button>
          </div>
        </div>
      </Card>

      {/* Thông tin phòng khám */}
      <Card className="mb-4 bg-gray-50">
        <h3 className="font-semibold mb-3">
          Phòng khám chuyên khoa mắt Luxury Eyes
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <EnvironmentOutlined className="text-blue-600 mt-1" />
            <span>Địa chỉ: Vân Canh - Hoài Đức</span>
          </div>
          <div className="flex items-start gap-2">
            <HomeOutlined className="text-blue-600 mt-1" />
            <span>
              Phòng khám: {scheduleItem ? scheduleItem.roomName : "Chưa rõ"}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">💰</span>
            <span>
              Giá khám:{" "}
              <span className="text-orange-500 font-semibold">
                {formatPrice(Number(selectedDoctor.price) || 0)} đ
              </span>
            </span>
          </div>
        </div>
      </Card>

      {/* Chọn khung giờ */}
      <TimeSlotPicker
        scheduleItem={
          scheduleItem
            ? { ...scheduleItem, timeSlots: slotsWithState }
            : undefined
        }
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedSchedule={selectedSlot as unknown as SelectedSchedule | null}
        handleTimeSelect={onTimeSelect}
      />
    </div>
  );
};

export default DoctorScheduleView;
