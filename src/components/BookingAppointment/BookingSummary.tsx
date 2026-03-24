import {
  CalendarOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Input } from "antd";
import type { Doctor } from "../../types/Doctor";
import type { SelectedSchedule } from "../../types/Schedule";

const { TextArea } = Input;

interface BookingSummaryProps {
  selectedDoctor: Doctor | null;
  selectedSchedule: SelectedSchedule | null;
  symptoms: string;
  onSymptomsChange: (value: string) => void;
  totalAmount: number;
  depositAmount: number;
  isSubmitting: boolean;
  onConfirm: () => void;
}

/**
 * Panel phải: tóm tắt thông tin đặt lịch, triệu chứng và nút xác nhận.
 */
const BookingSummary = ({
  selectedDoctor,
  selectedSchedule,
  symptoms,
  onSymptomsChange,
  totalAmount,
  depositAmount,
  isSubmitting,
  onConfirm,
}: BookingSummaryProps) => {
  if (!selectedSchedule || !selectedDoctor) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <CalendarOutlined className="text-6xl text-gray-300" />
        </div>
        <p className="text-gray-500">
          Vui lòng chọn bác sĩ và giờ khám để xem chi tiết.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Thông tin bác sĩ */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <Avatar
          size={48}
          src={selectedDoctor.avatar}
          icon={!selectedDoctor.avatar && <UserOutlined />}
        />
        <div>
          <h3 className="font-semibold text-gray-800">{selectedDoctor.name}</h3>
          <p className="text-xs text-gray-500">{selectedDoctor.specialty}</p>
        </div>
      </div>

      {/* Chi tiết lịch */}
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <CalendarOutlined className="text-blue-600 mt-1" />
          <div className="flex-1">
            <p className="text-xs text-gray-500">Thời gian khám</p>
            <p className="font-medium text-lg text-blue-700">
              {selectedSchedule.displayDate}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <EnvironmentOutlined className="text-blue-600 mt-1" />
          <div className="flex-1">
            <p className="text-xs text-gray-500">Địa chỉ</p>
            <p className="font-medium">{selectedSchedule.location}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <HomeOutlined className="text-blue-600 mt-1" />
          <div className="flex-1">
            <p className="text-xs text-gray-500">Phòng khám</p>
            <p className="font-medium">{selectedSchedule.room}</p>
          </div>
        </div>
      </div>

      {/* Triệu chứng */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vấn đề gặp phải
        </label>
        <TextArea
          rows={4}
          maxLength={255}
          showCount
          placeholder="Mô tả ngắn gọn triệu chứng..."
          value={symptoms}
          onChange={(e) => onSymptomsChange(e.target.value)}
        />
      </div>

      {/* Tóm tắt chi phí */}
      <div className="space-y-3 border-t pt-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Tổng phí khám</span>
          <span className="font-semibold text-gray-800">
            {totalAmount.toLocaleString("vi-VN")} đ
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Tiền cọc (40%)</span>
          <span className="font-bold text-orange-500">
            {depositAmount.toLocaleString("vi-VN")} đ
          </span>
        </div>
        <p className="text-xs text-gray-500">
          Sau khi đặt lịch, bạn sẽ được chuyển tới trang thanh toán. Nếu chưa
          thanh toán ngay, bạn vẫn có thể thanh toán lại trong vòng 5 phút tại
          trang lịch khám.
        </p>
      </div>

      <Button
        type="primary"
        size="large"
        block
        loading={isSubmitting}
        className="bg-orange-500 hover:bg-orange-600 border-0"
        onClick={onConfirm}
      >
        Đặt lịch & thanh toán cọc
      </Button>
    </div>
  );
};

export default BookingSummary;
