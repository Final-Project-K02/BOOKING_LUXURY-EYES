import { CalendarOutlined } from "@ant-design/icons";
import { Button, Card, Tabs } from "antd";
import { Link } from "react-router-dom";
import AppointmentCard from "../../components/appointment-history/AppointmentCard";
import AppointmentDetailModal from "../../components/appointment-history/AppointmentDetailModal";
import CancelAppointmentModal from "../../components/appointment-history/CancelAppointmentModal";
import { useAppointmentHistory } from "../../hooks/useAppointmentHistory";

export type { AppointmentStatus } from "../../types/Booking";

const AppointmentHistoryPage = () => {
  const {
    activeTab,
    setActiveTab,
    selectedAppointment,
    detailModalVisible,
    cancelModalVisible,
    cancelReason,
    setCancelReason,
    otherReason,
    setOtherReason,
    now,
    filteredAppointments,
    tabItems,
    isLoading,
    isError,
    isCancelling,
    isPayingAgain,
    isDetailLoading,
    handleViewDetail,
    handleCancelAppointment,
    handlePayNow,
    confirmCancel,
    closeDetailModal,
    closeCancelModal,
    canPayAgain,
    isExpiredPayment,
  } = useAppointmentHistory();

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
            filteredAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment._id}
                appointment={appointment}
                now={now}
                isPayingAgain={isPayingAgain}
                canPayAgain={canPayAgain}
                isExpiredPayment={isExpiredPayment}
                onViewDetail={handleViewDetail}
                onCancelAppointment={handleCancelAppointment}
                onPayNow={handlePayNow}
              />
            ))
          )}
        </div>
      </div>

      <AppointmentDetailModal
        open={detailModalVisible}
        appointment={selectedAppointment}
        isDetailLoading={isDetailLoading}
        isExpiredPayment={isExpiredPayment}
        onClose={closeDetailModal}
      />

      <CancelAppointmentModal
        open={cancelModalVisible}
        appointment={selectedAppointment}
        cancelReason={cancelReason}
        otherReason={otherReason}
        isCancelling={isCancelling}
        onCancelReasonChange={setCancelReason}
        onOtherReasonChange={setOtherReason}
        onConfirm={confirmCancel}
        onClose={closeCancelModal}
      />
    </div>
  );
};

export default AppointmentHistoryPage;
