import {
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Card, Input, Pagination } from "antd";
import AddPatientModal from "../../components/client/BookingAppointment/AddPatientModal";
import BookingFilterSidebar from "../../components/client/BookingAppointment/BookingFilterSidebar";
import BookingSummary from "../../components/client/BookingAppointment/BookingSummary";
import DoctorList from "../../components/client/BookingAppointment/DoctorList";
import DoctorScheduleView from "../../components/client/BookingAppointment/DoctorScheduleView";
import { useBooking } from "../../hooks/client/useBooking";

const BookingAppointmentPage = () => {
  const booking = useBooking();

  if (booking.isLoading)
    return <div className="text-center mt-3">Loading...</div>;
  if (booking.isError)
    return <div className="text-center mt-3">Error loading doctors</div>;

  return (
    <div className="min-h-screen bg-gray-50 my-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Panel trái – chọn bệnh nhân & lọc ngày */}
          <div className="lg:col-span-3">
            <BookingFilterSidebar
              selectedPerson={booking.selectedPerson}
              onPatientChange={booking.handlePatientChange}
              patientList={booking.patientList}
              fromDate={booking.fromDate}
              toDate={booking.toDate}
              onRangeChange={booking.handleRangeChange}
              disabledDate={booking.disabledDate}
              onEditPatient={booking.openEditModal}
              onDeletePatient={booking.handleDeletePatient}
            />
          </div>

          {/* Panel giữa – danh sách bác sĩ hoặc lịch khám */}
          <div className="lg:col-span-6">
            <Card className="shadow-sm">
              {/* Thanh tìm kiếm */}
              <div className="mb-4">
                <Input
                  size="large"
                  placeholder="Tìm kiếm theo tên bác sĩ..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  maxLength={100}
                  value={booking.inputSearch}
                  onChange={(e) => booking.setInputSearch(e.target.value)}
                />
                <div className="my-2 flex justify-start gap-2">
                  <Button size="large" icon={<UserOutlined />}>
                    Tìm thấy{" "}
                    <span className="font-semibold">
                      {booking.doctorsData?.meta?.total ??
                        booking.doctors.length}{" "}
                      bác sĩ
                    </span>{" "}
                    phù hợp
                  </Button>
                  <Button size="large" onClick={booking.handleReset}>
                    Xóa bộ lọc
                  </Button>
                  <Button
                    size="large"
                    icon={<ReloadOutlined />}
                    loading={booking.isFetching}
                    disabled={booking.isFetching}
                    onClick={booking.refetchDoctors}
                  >
                    Làm mới dữ liệu
                  </Button>
                </div>
              </div>

              {/* Danh sách bác sĩ */}
              {!booking.selectedDoctor && (
                <>
                  <DoctorList
                    doctors={booking.doctors}
                    isFetching={booking.isFetching}
                    handleDoctorSelect={booking.handleDoctorSelect}
                  />
                  <div className="mt-4 flex justify-end">
                    <Pagination
                      current={booking.currentPage}
                      pageSize={
                        booking.doctorsData?.meta?.limit ?? booking.pageSize
                      }
                      total={
                        booking.doctorsData?.meta?.total ??
                        booking.doctors.length
                      }
                      onChange={(page) => {
                        booking.setCurrentPage(page);
                        booking.handleBackToList();
                      }}
                      showSizeChanger={false}
                    />
                  </div>
                </>
              )}

              {/* Lịch khám của bác sĩ đã chọn */}
              {booking.selectedDoctor && (
                <DoctorScheduleView
                  selectedDoctor={booking.selectedDoctor}
                  scheduleItem={booking.scheduleItem}
                  slotsWithState={booking.slotsWithState}
                  selectedDate={booking.selectedDate}
                  setSelectedDate={booking.setSelectedDate}
                  selectedSlot={booking.selectedSlot}
                  onTimeSelect={booking.handleTimeSelect}
                  onBackToList={booking.handleBackToList}
                />
              )}
            </Card>
          </div>

          {/* Panel phải – tóm tắt & xác nhận */}
          <div className="lg:col-span-3">
            <Card className="shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Tóm tắt lịch khám
              </h2>
              <BookingSummary
                selectedDoctor={booking.selectedDoctor}
                selectedSchedule={booking.selectedSchedule}
                symptoms={booking.symptoms}
                onSymptomsChange={booking.setSymptoms}
                totalAmount={booking.totalAmount}
                depositAmount={booking.depositAmount}
                isSubmitting={booking.isSubmitting}
                onConfirm={() =>
                  booking.handleConfirmBooking(booking.selectedPerson)
                }
              />
            </Card>
          </div>
        </div>
      </div>

      {/* Modal thêm/sửa hồ sơ bệnh nhân */}
      <AddPatientModal
        visible={booking.showAddPatientModal}
        onCancel={booking.closeModal}
        onSubmit={booking.handleAddPatient}
        confirmLoading={booking.isCreatingPatient || booking.isUpdatingPatient}
        editingPatient={booking.editingPatient}
        isEditing={booking.isEditing}
      />
    </div>
  );
};

export default BookingAppointmentPage;
