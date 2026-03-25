import { Input, Modal, Radio } from "antd";
import type { Appointment } from "../../types/Booking";
import type { CancelOption } from "../../types/AppointmentManagement";
import {
  getPatientName,
  requiresRefundChoice,
} from "../../utils/AppointmentManagement/appointmentAdminHelpers";

const { TextArea } = Input;

interface AppointmentCancelModalProps {
  open: boolean;
  appointment: Appointment | null;
  adminNote: string;
  cancelOption: CancelOption | undefined;
  confirmLoading: boolean;
  onAdminNoteChange: (value: string) => void;
  onCancelOptionChange: (value: CancelOption) => void;
  onConfirm: () => void;
  onClose: () => void;
}

const AppointmentCancelModal = ({
  open,
  appointment,
  adminNote,
  cancelOption,
  confirmLoading,
  onAdminNoteChange,
  onCancelOptionChange,
  onConfirm,
  onClose,
}: AppointmentCancelModalProps) => {
  return (
    <Modal
      title="Xác nhận hủy lịch"
      open={open}
      onCancel={onClose}
      onOk={onConfirm}
      okText="Xác nhận hủy"
      cancelText="Đóng"
      okButtonProps={{ danger: true }}
      confirmLoading={confirmLoading}
    >
      {appointment && (
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Bệnh nhân</div>
            <div>{getPatientName(appointment)}</div>
          </div>

          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Lý do hủy từ người dùng
            </div>
            <div>
              {appointment.reason?.trim() || "Chưa có lý do từ người dùng"}
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>
              Ghi chú hủy của phòng khám
            </div>
            <TextArea
              rows={4}
              maxLength={500}
              showCount
              value={adminNote}
              placeholder="Nhập ghi chú của admin trước khi xác nhận hủy"
              onChange={(e) => onAdminNoteChange(e.target.value)}
            />
          </div>

          {requiresRefundChoice(appointment) && (
            <div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                Chính sách hoàn tiền
              </div>
              <Radio.Group
                value={cancelOption}
                onChange={(e) =>
                  onCancelOptionChange(e.target.value as CancelOption)
                }
              >
                <Radio value="REFUND">Hủy và hoàn tiền</Radio>
                <Radio value="NO_REFUND">Hủy không hoàn tiền</Radio>
              </Radio.Group>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default AppointmentCancelModal;
