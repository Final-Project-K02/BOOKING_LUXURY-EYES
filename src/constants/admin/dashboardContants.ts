// Số lượng bác sĩ tối đa được fetch lịch cùng lúc
export const DOCTOR_FETCH_LIMIT = 10;

// Map trạng thái lịch hẹn → màu sắc và nhãn hiển thị
export const APPOINTMENT_STATUS_MAP: Record<
  string,
  { color: string; text: string }
> = {
  // Pascal case (legacy)
  Pending: { color: "orange", text: "Chờ thanh toán" },
  Confirmed: { color: "green", text: "Đã xác nhận" },
  Completed: { color: "blue", text: "Hoàn thành" },
  Cancelled: { color: "red", text: "Đã huỷ" },
  Canceled: { color: "red", text: "Đã huỷ" },
  // UPPERCASE
  PENDING: { color: "orange", text: "Chờ thanh toán" },
  CONFIRM: { color: "green", text: "Đã xác nhận" },
  CONFIRMED: { color: "green", text: "Đã xác nhận" },
  CHECKIN: { color: "blue", text: "Đã check-in" },
  DONE: { color: "cyan", text: "Hoàn thành" },
  COMPLETED: { color: "blue", text: "Hoàn thành" },
  CANCELLED: { color: "red", text: "Đã huỷ" },
  CANCELED: { color: "red", text: "Đã huỷ" },
  "REQUEST-CANCELED": { color: "volcano", text: "Yêu cầu huỷ" },
};
