import { CloseCircleOutlined } from "@ant-design/icons";
import { Button, Modal, Tag } from "antd";
import dayjs from "dayjs";
import type { Appointment } from "../../types/Booking";
import {
  getCanceledByText,
  getDepositAmount,
  getDoctorName,
  getPatientName,
  getPatientPhone,
  getPaymentStatusText,
  getRefundPolicyText,
  getStatusConfig,
  getTotalAmount,
} from "./appointmentHelpers";

interface AppointmentDetailModalProps {
  open: boolean;
  appointment: Appointment | null;
  isDetailLoading: boolean;
  isExpiredPayment: (appointment: Appointment) => boolean;
  onClose: () => void;
}

const AppointmentDetailModal = ({
  open,
  appointment,
  isDetailLoading,
  isExpiredPayment,
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
      width={600}
    >
      {isDetailLoading && (
        <div className="text-sm text-gray-500">Đang tải chi tiết...</div>
      )}
      {appointment && (
        <div className="space-y-4">
          <div
            className={`p-4 rounded-lg ${
              isExpiredPayment(appointment)
                ? "bg-red-50"
                : getStatusConfig(appointment.status).bgColor
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">Trạng thái:</span>
              <Tag
                color={
                  isExpiredPayment(appointment)
                    ? "red"
                    : getStatusConfig(appointment.status).color
                }
                icon={
                  isExpiredPayment(appointment) ? (
                    <CloseCircleOutlined />
                  ) : (
                    getStatusConfig(appointment.status).icon
                  )
                }
                className="text-sm px-3 py-1"
              >
                {isExpiredPayment(appointment)
                  ? "Hết hạn thanh toán"
                  : getStatusConfig(appointment.status).text}
              </Tag>
            </div>
          </div>

          <div className="border-b pb-3">
            <h4 className="font-semibold text-gray-700 mb-2">Thanh toán</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Phương thức thanh toán:</span>
                <span className="font-medium text-right">
                  {appointment.payment?.paymentMethod === "PAY_AT_CLINIC"
                    ? "Thanh toán sau tại phòng khám"
                    : appointment.payment?.paymentMethod || "VNPAY"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Trạng thái thanh toán:</span>
                <span className="font-medium text-right">
                  {getPaymentStatusText(
                    isExpiredPayment(appointment)
                      ? "EXPIRED"
                      : appointment.payment?.paymentStatus,
                  )}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Tiền cọc:</span>
                <span className="font-medium text-right">
                  {getDepositAmount(appointment).toLocaleString("vi-VN")} đ
                </span>
              </div>
              {appointment.payment?.expireAt &&
                appointment.payment?.paymentStatus !== "PAID" && (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Hạn thanh toán:</span>
                    <span className="font-medium text-right">
                      {dayjs(appointment.payment.expireAt).format(
                        "YYYY-MM-DD HH:mm:ss",
                      )}
                    </span>
                  </div>
                )}
              {appointment.status === "CANCELED" && (
                <>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Hủy bởi:</span>
                    <span className="font-medium text-right">
                      {getCanceledByText(appointment)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Chính sách hoàn tiền:</span>
                    <span className="font-medium text-right">
                      {getRefundPolicyText(appointment)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="border-b pb-3">
            <h4 className="font-semibold text-gray-700 mb-2">
              Thông tin bệnh nhân
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Họ và tên:</span>
                <span className="font-medium text-right">
                  {getPatientName(appointment)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Số điện thoại:</span>
                <span className="font-medium text-right">
                  {getPatientPhone(appointment)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Mã phiếu:</span>
                <span className="font-medium text-right">
                  {appointment._id?.slice(-6).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="border-b pb-3">
            <h4 className="font-semibold text-gray-700 mb-2">Thông tin khám</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Bác sĩ:</span>
                <span className="font-medium text-right">
                  {getDoctorName(appointment)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Kinh nghiệm:</span>
                <span className="font-medium text-right">
                  {appointment?.doctor?.experience_year || 0} năm
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Thời gian:</span>
                <span className="font-medium text-right">
                  {appointment.time} -{" "}
                  {dayjs(appointment.dateTime).format("YYYY-MM-DD")}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Địa điểm:</span>
                <span className="font-medium text-right">
                  {appointment.location || "Chưa có thông tin"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Phòng khám:</span>
                <span className="font-medium text-right">
                  {appointment?.room?.name || "Không có"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-between border-b pb-3 gap-2">
            <h4 className="font-semibold text-gray-700">
              {appointment.status === "CANCELED" ? "Lý do hủy" : "Lý do khám"}
            </h4>
            <p className="text-sm text-gray-600 line-clamp-3 text-right max-w-[70%]">
              {appointment.status === "CANCELED"
                ? appointment.reason ||
                  (appointment.canceledBy === "system"
                    ? "Hệ thống tự động hủy do quá hạn thanh toán"
                    : "Không có lý do hủy")
                : appointment?.symptoms || "Không có"}
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center gap-4">
              <span className="font-semibold text-gray-700">Tổng chi phí:</span>
              <span className="text-xl font-bold text-orange-600">
                {getTotalAmount(appointment).toLocaleString("vi-VN")} đ
              </span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default AppointmentDetailModal;
