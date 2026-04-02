import { Button, Card, Result, Spin } from "antd";
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetVnpayPaymentStatusQuery } from "../../app/services/paymentApi";

const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const successParam = searchParams.get("success");
  const txnRef = searchParams.get("txnRef");

  const paidAmount = searchParams.get("depositAmount");
  const paidAt = searchParams.get("paidAt");

  const success = successParam === "true";

  const formattedPaidAmount = useMemo(() => {
    if (!paidAmount) return undefined;
    const v = Number(paidAmount);
    if (Number.isNaN(v)) return undefined;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v);
  }, [paidAmount]);

  const formattedPaidAt = useMemo(() => {
    if (!paidAt) return undefined;
    const d = new Date(paidAt);
    if (Number.isNaN(d.getTime())) return undefined;
    return d.toLocaleString("vi-VN");
  }, [paidAt]);

  const {
    data: statusData,
    isLoading,
    isError,
  } = useGetVnpayPaymentStatusQuery(txnRef ?? "", {
    skip: !txnRef,
    refetchOnMountOrArgChange: true,
  });

  const appointmentStatus = statusData?.data?.status;
  const paymentStatus = statusData?.data?.paymentStatus;

  const appointmentStatusLabel = useMemo(() => {
    if (!appointmentStatus) return undefined;
    switch (appointmentStatus) {
      case "PENDING":
        return "Chờ thanh toán";
      case "CONFIRM":
        return "Đã xác nhận";
      case "CANCELED":
        return paymentStatus === "EXPIRED"
          ? "Đã bị hệ thống hủy do hết hạn thanh toán"
          : "Đã hủy";
      default:
        return appointmentStatus;
    }
  }, [appointmentStatus, paymentStatus]);

  const message = useMemo(() => {
    if (isError) {
      return "Không thể lấy trạng thái thanh toán. Vui lòng thử lại.";
    }

    if (!txnRef) {
      return "Thiếu thông tin tham chiếu giao dịch.";
    }

    if (success) {
      return "Giao dịch đã được xác nhận. Bạn có thể kiểm tra trạng thái tại trang Lịch khám.";
    }

    if (appointmentStatus === "CANCELED" && paymentStatus === "EXPIRED") {
      return "Thời gian thanh toán đã hết hạn. Lịch hẹn đã được hệ thống tự động hủy.";
    }

    return "Thanh toán không thành công. Vui lòng thử lại hoặc kiểm tra lại thông tin.";
  }, [appointmentStatus, isError, paymentStatus, success, txnRef]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-lg">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spin size="large" />
          </div>
        ) : (
          <Result
            status={success ? "success" : "error"}
            title={success ? "Thanh toán hoàn tất" : "Thanh toán thất bại"}
            subTitle={
              <div className="space-y-2 text-sm text-gray-600">
                <p>{message}</p>
                {txnRef && (
                  <p>
                    <strong>Mã tham chiếu:</strong> {txnRef}
                  </p>
                )}
                {formattedPaidAmount && (
                  <p>
                    <strong>Số tiền cọc:</strong> {formattedPaidAmount}
                  </p>
                )}
                {formattedPaidAt && (
                  <p>
                    <strong>Thời gian thanh toán:</strong> {formattedPaidAt}
                  </p>
                )}
                {appointmentStatusLabel && (
                  <p>
                    <strong>Trạng thái lịch:</strong> {appointmentStatusLabel}
                  </p>
                )}
              </div>
            }
            extra={[
              <Button key="home" onClick={() => navigate("/")}>
                Về trang chủ
              </Button>,
              <Button
                key="appointments"
                type="primary"
                onClick={() => navigate("/lich-kham")}
              >
                Xem lịch khám
              </Button>,
            ]}
          />
        )}
      </Card>
    </div>
  );
};

export default PaymentResultPage;
