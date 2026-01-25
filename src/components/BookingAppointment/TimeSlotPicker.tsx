import { CloudOutlined, SunOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { getDayLabel } from "../../utils/dateUtils";
import type {
  DoctorSchedule,
  SelectedSchedule,
  TimeSlot,
  TimeSlotUI,
} from "../../types/Schedule";
import dayjs from "dayjs";

interface TimeSlotPickerProps {
  scheduleItem?: DoctorSchedule;
  selectedDate: number | null;
  setSelectedDate: (idx: number) => void;
  selectedSchedule: SelectedSchedule | null;
  handleTimeSelect: (slot: TimeSlot) => void;
}

const TimeSlotPicker = ({
  scheduleItem,
  setSelectedDate,
  selectedDate,
  selectedSchedule,
  handleTimeSelect,
}: TimeSlotPickerProps) => {
  let validTimeSlots: TimeSlot[] = [...(scheduleItem?.timeSlots ?? [])];

  // SẮP XẾP THEO NGÀY TĂNG DẦN
  validTimeSlots = validTimeSlots.sort((a, b) =>
    dayjs(a.date).diff(dayjs(b.date)),
  );

  // Tạo danh sách các ngày DUY NHẤT
  const uniqueDateSlots = Array.from(
    validTimeSlots
      .reduce((map, slot) => {
        const key = dayjs(slot.date).format("YYYY-MM-DD");
        if (!map.has(key)) map.set(key, slot); // giữ slot đầu tiên của ngày đó
        return map;
      }, new Map<string, TimeSlot>())
      .values(),
  );

  // Xác định ngày được chọn (dựa trên index trong uniqueDateSlots)
  const selectedSlot =
    selectedDate !== null ? uniqueDateSlots[selectedDate] : null;
  const selectedDay = selectedSlot
    ? dayjs(selectedSlot.date).startOf("day")
    : null;

  // Lấy tất cả slot của ngày đã chọn + loại bỏ trùng giờ + SẮP XẾP THEO GIỜ
  const slotsOfSelectedDay: TimeSlotUI[] = selectedDay
    ? Array.from(
        validTimeSlots
          .filter((slot) => dayjs(slot.date).startOf("day").isSame(selectedDay))
          .reduce((map, slot) => {
            const key = slot.time; // deduplicate theo giờ
            if (!map.has(key)) {
              map.set(key, slot);
            }
            return map;
          }, new Map<string, TimeSlot>())
          .values(), // values() trả về Iterator
      )
        // Sắp xếp giờ tăng dần
        .sort((a, b) => a.time.localeCompare(b.time))
    : [];

  // Chia sáng / chiều
  const morningSlots = slotsOfSelectedDay.filter(
    (slot) => parseInt(slot.time.split(":")[0]) < 12,
  );

  const afternoonSlots = slotsOfSelectedDay.filter(
    (slot) => parseInt(slot.time.split(":")[0]) >= 12,
  );
  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn ngày khám:
        </label>
        <div className="grid grid-cols-4 gap-2">
          {uniqueDateSlots.length > 0 ? (
            uniqueDateSlots?.map((slot, idx) => {
              const dayLabel = getDayLabel(slot.date);
              const dayDate = new Date(slot.date).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
              });

              const isSelected = selectedDay?.isSame(
                dayjs(slot.date).startOf("day"),
              );
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(idx)}
                  className={`px-3 py-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold text-sm">{dayLabel}</div>
                    <div className="text-xs mt-1">{dayDate}</div>
                  </div>
                </button>
              );
            })
          ) : (
            <p>Chưa có ngày cụ thể</p>
          )}
        </div>

        {selectedDay ? (
          <>
            {/* Sáng */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <SunOutlined className="text-yellow-500" />
                <span className="font-semibold">Sáng</span>
              </div>

              {morningSlots.length > 0 ? (
                <div className="grid grid-cols-5 gap-2">
                  {morningSlots.map((slot) => (
                    <Tooltip
                      key={slot.scheduleSlotId + slot.time}
                      title={slot.disabledReason}
                    >
                      <Button
                        type={
                          selectedSchedule &&
                          selectedSchedule.time === slot.time &&
                          selectedSchedule.date === slot.date
                            ? "primary"
                            : "default"
                        }
                        onClick={() => handleTimeSelect(slot)}
                        disabled={slot.disabled} // <-- khóa slot đã bị đặt hoặc không khả dụng
                      >
                        {slot.time}
                      </Button>
                    </Tooltip>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Không có khung giờ sáng</p>
              )}
            </div>

            {/* Chiều */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CloudOutlined className="text-blue-500" />
                <span className="font-semibold">Chiều</span>
              </div>

              {afternoonSlots.length > 0 ? (
                <div className="grid grid-cols-5 gap-2">
                  {afternoonSlots.map((slot) => (
                    <Tooltip
                      key={slot.scheduleSlotId + slot.time}
                      title={slot.disabledReason}
                    >
                      <Button
                        type={
                          selectedSchedule &&
                          selectedSchedule.time === slot.time &&
                          selectedSchedule.date === slot.date
                            ? "primary"
                            : "default"
                        }
                        onClick={() => handleTimeSelect(slot)}
                        disabled={slot.disabled}
                      >
                        {slot.time}
                      </Button>
                    </Tooltip>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Không có khung giờ chiều</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500 mt-6">
            Vui lòng chọn một ngày để xem khung giờ khả dụng
          </p>
        )}
      </div>
    </div>
  );
};

export default TimeSlotPicker;
