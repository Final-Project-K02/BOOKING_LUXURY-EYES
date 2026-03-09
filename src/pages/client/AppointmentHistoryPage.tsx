import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  SyncOutlined,
  UserOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Input,
  message,
  Modal,
  Select,
  Tabs,
  Tag,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  useCancelAppointmentConfirmMutation,
  useCancelAppointmentMutation,
  useCreateVnpayLinkMutation,
  useGetAppointmentsQuery,
} from "../../app/services/appointmentApi";
import type { Appointment } from "../../types/Booking";
import { useAppSelector } from "../../app/hook";
import { skipToken } from "@reduxjs/toolkit/query";

const { TextArea } = Input;

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRM"
  | "CHECKIN"
  | "DONE"
  | "CANCELED"
  | "REQUEST-CANCELED";

const AppointmentHistoryPage = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState<string>("");
  const [otherReason, setOtherReason] = useState<string>("");
  const [now, setNow] = useState(dayjs());

  const user = useAppSelector((state) => state.auth.user);

  const { data, isLoading, isError, refetch } = useGetAppointmentsQuery(
    user?._id ?? skipToken,
    {
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
    },

  );

  const getAppointments: Appointment[] = data?.data ?? [];

  const [cancelAppointment, { isLoading: isCancelling }] =
    useCancelAppointmentMutation();
  const [cancelAppointmentConfirm] = useCancelAppointmentConfirmMutation();
  const [createVnpayLink, { isLoading: isPayingAgain }] =
    useCreateVnpayLinkMutation();

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(dayjs());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const appointmentStatus = {
    PENDING: {
      color: "orange",
      bgColor: "bg-orange-50",
      text: "Chờ thanh toán",
      icon: <ClockCircleOutlined />,
    },
    CONFIRM: {
      color: "blue",
      bgColor: "bg-blue-50",
      text: "Đã xác nhận",
      icon: <CheckCircleOutlined />,
    },
    CHECKIN: {
      color: "purple",
      bgColor: "bg-purple-50",
      text: "Đã check-in",
      icon: <SyncOutlined />,
    },
    DONE: {
      color: "green",
      bgColor: "bg-green-50",
      text: "Hoàn thành",
      icon: <CheckCircleOutlined />,
    },
    CANCELED: {
      color: "red",
      bgColor: "bg-red-50",
      text: "Đã hủy",
      icon: <CloseCircleOutlined />,
    },
    "REQUEST-CANCELED": {
      color: "gold",
      bgColor: "bg-yellow-50",
      text: "Đang yêu cầu hủy",
      icon: <ClockCircleOutlined />,
    },
  } as const;

  const getStatusConfig = (status: AppointmentStatus) => {
    return appointmentStatus[status];
  };

  const getDoctorName = (appointment: Appointment) => {
    return (
      appointment?.doctor?.name || appointment?.doctor?.fullName || "Bác sĩ"
    );
  };

  const getPatientName = (appointment: Appointment) => {
    // API sometimes returns a plain ID in `patient`, sometimes an object in `patientProfile`
    if (appointment.patientProfile?.fullName) return appointment.patientProfile.fullName;
    if (typeof appointment.patient === "object" && appointment.patient?.fullName)
      return appointment.patient.fullName;
    return "Không rõ";
  };

  const getPatientPhone = (appointment: Appointment) => {
    if (appointment.patientProfile?.phone) return appointment.patientProfile.phone;
    if (typeof appointment.patient === "object" && appointment.patient?.phone)
      return appointment.patient.phone;
    return "Không có";
  };

  const getTotalAmount = (appointment: Appointment) => {
    return Number(appointment?.payment?.totalAmount || 0);
  };

  const getDepositAmount = (appointment: Appointment) => {
    const manual = Number(appointment?.payment?.depositAmount || 0);
    if (manual > 0) return manual;

    const total = Number(appointment?.payment?.totalAmount || 0);
    return Math.ceil(total * 0.4);
  };

  const getPaymentStatusText = (paymentStatus?: string) => {
    switch (paymentStatus) {
      case "PAID":
        return "Đã thanh toán";
      case "PENDING":
        return "Đang chờ xử lý";
      case "EXPIRED":
        return "Hết hạn thanh toán";
      case "FAILED":
        return "Thanh toán thất bại";
      case "UNPAID":
      default:
        return "Chưa thanh toán";
    }
  };

  const getRemainingSeconds = (expireAt?: string | null) => {
    if (!expireAt) return 0;
    const diff = dayjs(expireAt).diff(now, "second");
    return diff > 0 ? diff : 0;
  };

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(remainSeconds).padStart(2, "0")}`;
  };

  const canPayAgain = (appointment: Appointment) => {
    const remaining = getRemainingSeconds(appointment?.payment?.expireAt);

    return (
      appointment?.status === "PENDING" &&
      appointment?.payment?.paymentStatus !== "PAID" &&
      remaining > 0
    );
  };

  const isExpiredPayment = (appointment: Appointment) => {
    const remaining = getRemainingSeconds(appointment?.payment?.expireAt);

    return (
      appointment?.status === "PENDING" &&
      appointment?.payment?.paymentStatus !== "PAID" &&
      remaining <= 0
    );
  };

  const filterAppointments = (status?: AppointmentStatus) => {
    let filtered = getAppointments;

    if (status) {
      filtered = filtered.filter((apt) => apt.status === status);
    }

    return filtered;
  };

  const handleViewDetail = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDetailModalVisible(true);
  };

  const handleCancelAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCancelModalVisible(true);
  };

  const handlePayNow = async (appointmentId: string) => {
    try {
      const res = await createVnpayLink(appointmentId).unwrap();
      const paymentUrl = res?.data?.paymentUrl;

      if (!paymentUrl) {
        message.error("Không tạo được link thanh toán");
        return;
      }

      message.loading("Đang chuyển tới cổng thanh toán...", 1);
      console.log("paymentUrl =", paymentUrl);
      window.location.href = paymentUrl;
    } catch (error) {
      console.log(error);
      message.error(
        error?.data?.message || "Không thể tạo link thanh toán lại",
      );
      refetch();
    }
  };

  const confirmCancel = async () => {
    if (!cancelReason) {
      message.error("Bạn phải chọn lý do hủy lịch");
      return;
    }

    if (cancelReason === "other" && !otherReason.trim()) {
      message.error("Vui lòng nhập lý do hủy lịch");
      return;
    }

    if (!selectedAppointment?._id) {
      message.error("Lịch hẹn không hợp lệ, không thể hủy");
      return;
    }

    const reason = cancelReason === "other" ? otherReason : cancelReason;

    const currentMonthCanceledCount = getAppointments.filter(
      (apm) =>
        (apm.status === "CANCELED" || apm.status === "REQUEST-CANCELED") &&
        dayjs(apm.updatedAt).isSame(dayjs(), "month"),

    ).length;

    if (currentMonthCanceledCount >= 4) {
      message.error("Bạn đã đạt giới hạn 4 lượt hủy trong tháng này");
      return;
    }

    try {
      if (selectedAppointment.status === "PENDING") {
        await cancelAppointment({
          id: selectedAppointment._id,
          reason,
          scheduleId: selectedAppointment.scheduleId,
        }).unwrap();
        message.success("Hủy lịch thành công");
      }

      if (selectedAppointment.status === "CONFIRM") {
        await cancelAppointmentConfirm({
          id: selectedAppointment._id,
          reason,
          scheduleId: selectedAppointment.scheduleId,
        }).unwrap();
        message.success("Gửi yêu cầu hủy lịch thành công");
      }

      refetch();
    } catch (error) {
      console.log(error);
      message.error("Thao tác thất bại");
    }

    setCancelModalVisible(false);
    setCancelReason("");
    setOtherReason("");
    setSelectedAppointment(null);
  };

  const tabItems = [
    {
      key: "all",
      label: `Tất cả (${getAppointments.length})`,
    },
    {
      key: "PENDING",
      label: `Chờ thanh toán (${
        getAppointments.filter((a) => a.status === "PENDING").length
      })`,
    },
    {
      key: "CONFIRM",
      label: `Đã xác nhận (${
        getAppointments.filter((a) => a.status === "CONFIRM").length
      })`,
    },
    {
      key: "CHECKIN",
      label: `Đã check-in (${
        getAppointments.filter((a) => a.status === "CHECKIN").length
      })`,
    },
    {
      key: "DONE",
      label: `Hoàn thành (${
        getAppointments.filter((a) => a.status === "DONE").length
      })`,
    },
    {
      key: "CANCELED",
      label: `Đã hủy (${
        getAppointments.filter((a) => a.status === "CANCELED").length
      })`,
    },
    {
      key: "REQUEST-CANCELED",
      label: `Đang yêu cầu hủy (${
        getAppointments.filter((a) => a.status === "REQUEST-CANCELED").length
      })`,
    },
  ];

  const filteredAppointments = useMemo(() => {
    if (activeTab === "all") return filterAppointments();
    return filterAppointments(activeTab as AppointmentStatus);
  }, [activeTab, getAppointments]);

  if (isLoading) return <div className="text-center mt-3">Loading...</div>;
  if (isError)
    return <div className="text-center mt-3">Error loading appointments</div>;

  return (
    <div className="min-h-screen bg-gray-50 my-4">
      <div className="max-w-7xl mx-auto px-4 mt-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Lịch khám của tôi
          </h1>
          <p className="text-gray-600">
            Quản lý và theo dõi lịch hẹn khám bệnh
          </p>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="mb-4"
        />

        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <Card className="text-center py-12">
              <CalendarOutlined className="text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500">Không có lịch khám nào</p>
              <Link to="/dat-lich-kham">
                <Button icon={<CalendarOutlined />} block>
                  Đặt lịch khám mới
                </Button>
              </Link>
            </Card>
          ) : (
            filteredAppointments.map((appointment) => {
              const statusConfig = getStatusConfig(appointment.status);
              const remainingSeconds = getRemainingSeconds(
                appointment?.payment?.expireAt,
              );

              return (
                <Card
                  key={appointment._id}
                  className="shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <Avatar size={64} icon={<UserOutlined />} />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2 gap-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">
                                {getDoctorName(appointment)}
                              </h3>
                              <p className="text-sm text-blue-600">
                                {appointment?.room?.name ||
                                  "Chưa rõ phòng khám"}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Mã phiếu:{" "}
                                <span className="font-semibold">
                                  {appointment._id?.slice(-6).toUpperCase()}
                                </span>
                              </p>
                            </div>

                            <Tag
                              color={
                                isExpiredPayment(appointment)
                                  ? "red"
                                  : statusConfig.color
                              }
                              icon={
                                isExpiredPayment(appointment) ? (
                                  <CloseCircleOutlined />
                                ) : (
                                  statusConfig.icon
                                )
                              }
                              className="text-sm px-3 py-1"
                            >
                              {isExpiredPayment(appointment)
                                ? "Hết hạn thanh toán"
                                : statusConfig.text}
                            </Tag>
                          </div>

                          <div className="grid md:grid-cols-2 gap-2 mt-3">
                            <div className="flex items-center gap-2 text-sm">
                              <CalendarOutlined className="text-gray-400" />
                              <span>
                                {dayjs(appointment.dateTime).format(
                                  "YYYY-MM-DD",
                                )}{" "}
                                - {appointment.time}
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
                                {getTotalAmount(appointment).toLocaleString(
                                  "vi-VN",
                                )}{" "}
                                đ
                              </span>
                            </div>
                          </div>

                          {canPayAgain(appointment) && (
                            <div className="mt-4 rounded-lg bg-orange-50 border border-orange-200 p-3">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                  <div className="font-semibold text-orange-700">
                                    Chờ thanh toán cọc
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Tiền cọc:{" "}
                                    <span className="font-semibold">
                                      {getDepositAmount(
                                        appointment,
                                      ).toLocaleString("vi-VN")}{" "}
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
                                  onClick={() => handlePayNow(appointment._id)}
                                >
                                  Thanh toán ngay
                                </Button>
                              </div>
                            </div>
                          )}

                          {isExpiredPayment(appointment) && (
                            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                              Lịch hẹn này đã hết hạn thanh toán. Vui lòng đặt
                              lịch mới nếu bạn muốn tiếp tục.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex lg:flex-col gap-2 lg:w-44">
                      <Button
                        type="primary"
                        icon={<FileTextOutlined />}
                        onClick={() => handleViewDetail(appointment)}
                        block
                      >
                        Chi tiết
                      </Button>

                      {(appointment.status === "PENDING" ||
                        appointment.status === "CONFIRM") && (
                        <Button
                          danger
                          icon={<CloseCircleOutlined />}
                          onClick={() => handleCancelAppointment(appointment)}
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

                      {(appointment.status === "CANCELED" ||
                        isExpiredPayment(appointment)) && (
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
            })
          )}
        </div>
      </div>

      <Modal
        title="Chi tiết lịch khám"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-lg ${
                isExpiredPayment(selectedAppointment)
                  ? "bg-red-50"
                  : getStatusConfig(selectedAppointment.status).bgColor
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">Trạng thái:</span>
                <Tag
                  color={
                    isExpiredPayment(selectedAppointment)
                      ? "red"
                      : getStatusConfig(selectedAppointment.status).color
                  }
                  icon={
                    isExpiredPayment(selectedAppointment) ? (
                      <CloseCircleOutlined />
                    ) : (
                      getStatusConfig(selectedAppointment.status).icon
                    )
                  }
                  className="text-sm px-3 py-1"
                >
                  {isExpiredPayment(selectedAppointment)
                    ? "Hết hạn thanh toán"
                    : getStatusConfig(selectedAppointment.status).text}
                </Tag>
              </div>
            </div>

            <div className="border-b pb-3">
              <h4 className="font-semibold text-gray-700 mb-2">Thanh toán</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Phương thức thanh toán:</span>
                  <span className="font-medium text-right">
                    {selectedAppointment.payment?.paymentMethod ===
                    "PAY_AT_CLINIC"
                      ? "Thanh toán sau tại phòng khám"
                      : selectedAppointment.payment?.paymentMethod || "VNPAY"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Trạng thái thanh toán:</span>
                  <span className="font-medium text-right">
                    {getPaymentStatusText(
                      isExpiredPayment(selectedAppointment)
                        ? "EXPIRED"
                        : selectedAppointment.payment?.paymentStatus,
                    )}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Tiền cọc:</span>
                  <span className="font-medium text-right">
                    {getDepositAmount(selectedAppointment).toLocaleString(
                      "vi-VN",
                    )}{" "}
                    đ
                  </span>
                </div>

                {selectedAppointment.payment?.expireAt &&
                  selectedAppointment.payment?.paymentStatus !== "PAID" && (
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">Hạn thanh toán:</span>
                      <span className="font-medium text-right">
                        {dayjs(selectedAppointment.payment.expireAt).format(
                          "YYYY-MM-DD HH:mm:ss",
                        )}
                      </span>
                    </div>
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
                    {getPatientName(selectedAppointment)}

                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Số điện thoại:</span>
                  <span className="font-medium text-right">
                    {getPatientPhone(selectedAppointment)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Mã phiếu:</span>
                  <span className="font-medium text-right">
                    {selectedAppointment._id?.slice(-6).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-b pb-3">
              <h4 className="font-semibold text-gray-700 mb-2">
                Thông tin khám
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Bác sĩ:</span>
                  <span className="font-medium text-right">
                    {getDoctorName(selectedAppointment)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Kinh nghiệm:</span>
                  <span className="font-medium text-right">
                    {selectedAppointment?.doctor?.experience_year || 0} năm
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Thời gian:</span>
                  <span className="font-medium text-right">
                    {selectedAppointment.time} -{" "}
                    {dayjs(selectedAppointment.dateTime).format("YYYY-MM-DD")}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Địa điểm:</span>
                  <span className="font-medium text-right">
                    {selectedAppointment.location || "Chưa có thông tin"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Phòng khám:</span>
                  <span className="font-medium text-right">
                    {selectedAppointment?.room?.name || "Không có"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-between border-b pb-3 gap-2">
              <h4 className="font-semibold text-gray-700">
                {selectedAppointment.status === "CANCELED"
                  ? "Lý do hủy"
                  : "Lý do khám"}
              </h4>
              <p className="text-sm text-gray-600 line-clamp-3 text-right max-w-[70%]">
                {selectedAppointment?.status === "CANCELED"
                  ? selectedAppointment.reason || "Không có lý do hủy"
                  : selectedAppointment?.symptoms || "Không có"}
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center gap-4">
                <span className="font-semibold text-gray-700">
                  Tổng chi phí:
                </span>
                <span className="text-xl font-bold text-orange-600">
                  {getTotalAmount(selectedAppointment).toLocaleString("vi-VN")}{" "}
                  đ
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="Hủy lịch khám"
        open={cancelModalVisible}
        onOk={confirmCancel}
        onCancel={() => {
          setCancelModalVisible(false);
          setCancelReason("");
          setOtherReason("");
        }}
        okText="Xác nhận hủy"
        okButtonProps={{
          danger: true,
          disabled:
            !cancelReason || (cancelReason === "other" && !otherReason.trim()),
        }}
        confirmLoading={isCancelling}
        cancelText="Đóng"
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div className="bg-red-50 p-3 rounded-lg flex items-start gap-2">
              <InfoCircleOutlined className="text-red-500 mt-1" />
              <div className="flex-1 text-sm">
                <p className="font-semibold text-red-800 mb-1">Lưu ý:</p>
                <p className="text-red-600">
                  Bạn có chắc chắn muốn hủy lịch khám với bác sĩ{" "}
                  <strong>{getDoctorName(selectedAppointment)}</strong> vào lúc{" "}
                  <strong>
                    {selectedAppointment.time} -{" "}
                    {dayjs(selectedAppointment.dateTime).format("YYYY-MM-DD")}
                  </strong>
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do hủy lịch <span className="text-red-500">*</span>
              </label>

              <Select
                value={cancelReason}
                onChange={setCancelReason}
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
                onChange={(e) => setOtherReason(e.target.value)}
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AppointmentHistoryPage;
