import {
  CalendarOutlined,
  CloseCircleOutlined,
  CreditCardOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Card, Tag } from "antd";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import type { Appointment } from "../../types/Booking";
import {
  formatCountdown,
  getCanceledByText,
  getDepositAmount,
  getDoctorAvatar,
  getDoctorName,
  getPatientName,
  getRefundPolicyText,
  getRemainingSeconds,
  getStatusConfig,
  getTotalAmount,
} from "./appointmentHelpers";

interface AppointmentCardProps {
  appointment: Appointment;
  now: dayjs.Dayjs;
  isPayingAgain: boolean;
  canPayAgain: (appointment: Appointment) => boolean;
  isExpiredPayment: (appointment: Appointment) => boolean;
  onViewDetail: (appointment: Appointment) => void;
  onCancelAppointment: (appointment: Appointment) => void;
  onPayNow: (appointmentId: string) => void;
}

const AppointmentCard = ({
  appointment,
  now,
  isPayingAgain,
  canPayAgain,
  isExpiredPayment,
  onViewDetail,
  onCancelAppointment,
  onPayNow,
}: AppointmentCardProps) => {
  const statusConfig = getStatusConfig(appointment.status);
  const remainingSeconds = getRemainingSeconds(
    appointment?.payment?.expireAt,
    now,
  );
  const expired = isExpiredPayment(appointment);
  const payable = canPayAgain(appointment);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-4">
            <Avatar
              size={64}
              src={getDoctorAvatar(appointment)}
              icon={!getDoctorAvatar(appointment) && <UserOutlined />}
            />
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {getDoctorName(appointment)}
                  </h3>
                  <p className="text-sm text-blue-600">
                    {appointment?.room?.name || "Chưa rõ phòng khám"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Mã phiếu:{" "}
                    <span className="font-semibold">
                      {appointment._id?.slice(-6).toUpperCase()}
                    </span>
                  </p>
                </div>

                <Tag
                  color={expired ? "red" : statusConfig.color}
                  icon={expired ? <CloseCircleOutlined /> : statusConfig.icon}
                  className="text-sm px-3 py-1"
                >
                  {expired ? "Hết hạn thanh toán" : statusConfig.text}
                </Tag>
              </div>

              <div className="grid md:grid-cols-2 gap-2 mt-3">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarOutlined className="text-gray-400" />
                  <span>
                    {dayjs(appointment.dateTime).format("YYYY-MM-DD")} -{" "}
                    {appointment.time}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <EnvironmentOutlined className="text-gray-400" />
                  <span className="truncate">
                    {appointment.location || "Chưa có thông tin"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <UserOutlined className="text-gray-400" />
                  <span>{getPatientName(appointment)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">💰</span>
                  <span className="font-semibold text-orange-600">
                    {getTotalAmount(appointment).toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>

              {payable && (
                <div className="mt-4 rounded-lg bg-orange-50 border border-orange-200 p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="font-semibold text-orange-700">
                        Chờ thanh toán cọc
                      </div>
                      <div className="text-sm text-gray-600">
                        Tiền cọc:{" "}
                        <span className="font-semibold">
                          {getDepositAmount(appointment).toLocaleString(
                            "vi-VN",
                          )}{" "}
                          đ
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Còn lại:{" "}
                        <span className="font-semibold text-red-500">
                          {formatCountdown(remainingSeconds)}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="primary"
                      icon={<CreditCardOutlined />}
                      loading={isPayingAgain}
                      onClick={() => onPayNow(appointment._id)}
                    >
                      Thanh toán ngay
                    </Button>
                  </div>
                </div>
              )}

              {expired && (
                <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                  Lịch hẹn này đã hết hạn thanh toán. Vui lòng đặt lịch mới nếu
                  bạn muốn tiếp tục.
                </div>
              )}

              {appointment.status === "CANCELED" && (
                <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm">
                  <div className="flex flex-wrap gap-x-6 gap-y-1">
                    <div>
                      <span className="text-gray-500">Hủy bởi:</span>{" "}
                      <span className="font-semibold text-gray-700">
                        {getCanceledByText(appointment)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Hoàn tiền:</span>{" "}
                      <span className="font-semibold text-gray-700">
                        {getRefundPolicyText(appointment)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex lg:flex-col gap-2 lg:w-44">
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            onClick={() => onViewDetail(appointment)}
            block
          >
            Chi tiết
          </Button>

          {(appointment.status === "PENDING" ||
            appointment.status === "CONFIRM") && (
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => onCancelAppointment(appointment)}
              block
            >
              Hủy lịch
            </Button>
          )}

          {appointment.status === "DONE" && (
            <Link to="/dat-lich-kham">
              <Button icon={<CalendarOutlined />} block>
                Đặt lịch khám mới
              </Button>
            </Link>
          )}

          {(appointment.status === "CANCELED" || expired) && (
            <Link to="/dat-lich-kham">
              <Button icon={<CalendarOutlined />} block>
                Đặt lại
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AppointmentCard;
