import { Button, Descriptions, Modal, Tag } from "antd";
import type { Appointment } from "../../../types/Booking";
import {
  PAYMENT_STATUS_MAP,
  STATUS_MAP,
} from "../../../constants/admin/appointmentAdminConstants";
import {
  getCancelByText,
  getBookingAccountEmail,
  getPatientName,
  getPatientPhone,
  isPaid,
} from "../../../utils/AppointmentManagement/appointmentAdminHelpers";

interface AppointmentDetailModalProps {
  open: boolean;
  appointment: Appointment | null;
  detailLoading: boolean;
  onClose: () => void;
}

const AppointmentDetailModal = ({
  open,
  appointment,
  detailLoading,
  onClose,
}: AppointmentDetailModalProps) => {
  return (
    <Modal
      title="Chi tiết lịch khám"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      width={700}
    >
      {appointment && (
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Mã lịch khám">
            {appointment._id}
          </Descriptions.Item>

          <Descriptions.Item label="Bệnh nhân">
            {getPatientName(appointment)}
          </Descriptions.Item>

          <Descriptions.Item label="Số điện thoại">
            {getPatientPhone(appointment)}
          </Descriptions.Item>

          <Descriptions.Item label="Email tài khoản đặt lịch">
            {getBookingAccountEmail(appointment)}
          </Descriptions.Item>

          <Descriptions.Item label="Bác sĩ">
            {typeof appointment.doctor === "object"
              ? (appointment.doctor as { name?: string; fullName?: string })
                  ?.name ||
                (appointment.doctor as { name?: string; fullName?: string })
                  ?.fullName ||
                "---"
              : "---"}
          </Descriptions.Item>

          <Descriptions.Item label="Ngày khám">
            {appointment.dateTime
              ? new Date(appointment.dateTime).toLocaleDateString("vi-VN")
              : "---"}
          </Descriptions.Item>

          <Descriptions.Item label="Giờ khám">
            {appointment.time || "---"}
          </Descriptions.Item>

          <Descriptions.Item label="Phòng">
            {appointment.room?.name || "---"}
          </Descriptions.Item>

          <Descriptions.Item label="Địa điểm">
            {appointment.location || "---"}
          </Descriptions.Item>

          <Descriptions.Item label="Triệu chứng">
            {appointment.symptoms || "---"}
          </Descriptions.Item>

          <Descriptions.Item label="Phương thức khám">
            {appointment.appointmentMethod === "offline"
              ? "Trực tiếp"
              : "Online"}
          </Descriptions.Item>

          <Descriptions.Item label="Trạng thái lịch">
            <Tag color={STATUS_MAP[appointment.status]?.color}>
              {appointment.status === "PENDING" && isPaid(appointment)
                ? "Chờ xác nhận"
                : appointment.status === "PENDING"
                  ? "Chờ thanh toán"
                  : STATUS_MAP[appointment.status]?.text}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Tổng tiền">
            {appointment.payment?.totalAmount?.toLocaleString("vi-VN") || 0} VNĐ
          </Descriptions.Item>

          <Descriptions.Item label="Tiền đặt cọc">
            {appointment.payment?.depositAmount?.toLocaleString("vi-VN") || 0}{" "}
            VNĐ ({appointment.payment?.depositRate || 0}%)
          </Descriptions.Item>

          <Descriptions.Item label="Phương thức thanh toán">
            {appointment.payment?.paymentMethod === "vnpay"
              ? "VNPay"
              : appointment.payment?.paymentMethod || "---"}
          </Descriptions.Item>

          <Descriptions.Item label="Trạng thái thanh toán">
            {(() => {
              const key = String(
                appointment.payment?.paymentStatus || "UNPAID",
              ).toUpperCase();
              const paymentStatus = PAYMENT_STATUS_MAP[key] || {
                text: key,
                color: "default",
              };
              return (
                <Tag color={paymentStatus.color}>{paymentStatus.text}</Tag>
              );
            })()}
          </Descriptions.Item>

          {appointment.payment?.paidAt && (
            <Descriptions.Item label="Thời gian thanh toán">
              {new Date(appointment.payment.paidAt).toLocaleString("vi-VN")}
            </Descriptions.Item>
          )}

          {appointment.payment?.txnRef && (
            <Descriptions.Item label="Mã giao dịch">
              {appointment.payment.txnRef}
            </Descriptions.Item>
          )}

          {appointment.payment?.vnpTransactionNo && (
            <Descriptions.Item label="Mã giao dịch VNPay">
              {appointment.payment.vnpTransactionNo}
            </Descriptions.Item>
          )}

          {appointment.status === "CANCELED" && (
            <>
              <Descriptions.Item label="Người hủy">
                {getCancelByText(appointment.canceledBy)}
              </Descriptions.Item>
              {appointment.canceledAt && (
                <Descriptions.Item label="Thời gian hủy">
                  {new Date(appointment.canceledAt).toLocaleString("vi-VN")}
                </Descriptions.Item>
              )}
              {appointment.reason && (
                <Descriptions.Item label="Lý do hủy">
                  {appointment.reason}
                </Descriptions.Item>
              )}
            </>
          )}

          {appointment.createdAt && (
            <Descriptions.Item label="Ngày tạo">
              {new Date(appointment.createdAt).toLocaleString("vi-VN")}
            </Descriptions.Item>
          )}

          {appointment.updatedAt && (
            <Descriptions.Item label="Cập nhật lần cuối">
              {new Date(appointment.updatedAt).toLocaleString("vi-VN")}
            </Descriptions.Item>
          )}
        </Descriptions>
      )}

      {detailLoading && (
        <div style={{ marginTop: 12 }}>Đang tải chi tiết...</div>
      )}
    </Modal>
  );
};

export default AppointmentDetailModal;
