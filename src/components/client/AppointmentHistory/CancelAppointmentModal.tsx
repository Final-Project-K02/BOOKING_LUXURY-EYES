import { InfoCircleOutlined } from "@ant-design/icons";
import { Input, Modal, Select } from "antd";
import dayjs from "dayjs";
import type { Appointment } from "../../../types/Booking";
import { getDoctorName } from "./appointmentHelpers";

const { TextArea } = Input;

interface CancelAppointmentModalProps {
  open: boolean;
  appointment: Appointment | null;
  cancelReason: string;
  otherReason: string;
  isCancelling: boolean;
  onCancelReasonChange: (reason: string) => void;
  onOtherReasonChange: (reason: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

const CancelAppointmentModal = ({
  open,
  appointment,
  cancelReason,
  otherReason,
  isCancelling,
  onCancelReasonChange,
  onOtherReasonChange,
  onConfirm,
  onClose,
}: CancelAppointmentModalProps) => {
  return (
    <Modal
      title="Hủy lịch khám"
      open={open}
      onOk={onConfirm}
      onCancel={onClose}
      okText="Xác nhận hủy"
      okButtonProps={{
        danger: true,
        disabled:
          !cancelReason || (cancelReason === "other" && !otherReason.trim()),
      }}
      confirmLoading={isCancelling}
      cancelText="Đóng"
    >
      {appointment && (
        <div className="space-y-4">
          <div className="bg-red-50 p-3 rounded-lg flex items-start gap-2">
            <InfoCircleOutlined className="text-red-500 mt-1" />
            <div className="flex-1 text-sm">
              <p className="font-semibold text-red-800 mb-1">Lưu ý:</p>
              <p className="text-red-600">
                Bạn có chắc chắn muốn hủy lịch khám với bác sĩ{" "}
                <strong>{getDoctorName(appointment)}</strong> vào lúc{" "}
                <strong>
                  {appointment.time} -{" "}
                  {dayjs(appointment.dateTime).format("YYYY-MM-DD")}
                </strong>
              </p>
              <p className="text-red-700 font-medium mt-2">
                Nếu bạn tự hủy lịch, tiền cọc đã thanh toán sẽ không được hoàn
                lại.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do hủy lịch <span className="text-red-500">*</span>
            </label>
            <Select
              value={cancelReason}
              onChange={onCancelReasonChange}
              placeholder="Chọn lý do hủy lịch"
              className="w-full"
              size="large"
            >
              <Select.Option value="busy">Bận việc đột xuất</Select.Option>
              <Select.Option value="rescheduled">
                Muốn đổi lịch khác
              </Select.Option>
              <Select.Option value="other">Lý do khác</Select.Option>
            </Select>
          </div>

          {cancelReason === "other" && (
            <TextArea
              rows={3}
              placeholder="Nhập lý do hủy lịch..."
              className="w-full"
              value={otherReason}
              onChange={(e) => onOtherReasonChange(e.target.value)}
            />
          )}
        </div>
      )}
    </Modal>
  );
};

export default CancelAppointmentModal;
