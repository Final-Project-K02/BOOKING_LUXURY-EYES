import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Input, Pagination } from "antd";
import type { Dayjs } from "dayjs";
import { useMemo } from "react";
import AddPatientModal from "../../components/client/BookingAppointment/AddPatientModal";
import BookingFilterSidebar from "../../components/client/BookingAppointment/BookingFilterSidebar";
import BookingSummary from "../../components/client/BookingAppointment/BookingSummary";
import DoctorList from "../../components/client/BookingAppointment/DoctorList";
import DoctorScheduleView from "../../components/client/BookingAppointment/DoctorScheduleView";
import { useBooking } from "../../hooks/BookingAppointment/useBooking";
import { useDoctorSearch } from "../../hooks/BookingAppointment/useDoctorSearch";
import { usePatientProfile } from "../../hooks/BookingAppointment/usePatientProfile";

const BookingAppointmentPage = () => {
  const doctorSearch = useDoctorSearch();
  const patientProfile = usePatientProfile();
  const booking = useBooking();

  const doctors = useMemo(
    () => doctorSearch.data?.data ?? [],
    [doctorSearch.data],
  );

  // Khi reset bộ lọc → cũng bỏ chọn bác sĩ
  const handleReset = () => {
    doctorSearch.handleReset();
    booking.handleBackToList();
  };

  // Khi đổi date range → cũng bỏ chọn bác sĩ (giống behavior gốc)
  const handleRangeChange = (dates: (Dayjs | null)[] | null) => {
    doctorSearch.handleRangeChange(dates);
    booking.handleBackToList();
  };

  if (doctorSearch.isLoading)
    return <div className="text-center mt-3">Loading...</div>;
  if (doctorSearch.isError)
    return <div className="text-center mt-3">Error loading doctors</div>;

  return (
    <div className="min-h-screen bg-gray-50 my-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Panel trái – chọn bệnh nhân & lọc ngày */}
          <div className="lg:col-span-3">
            <BookingFilterSidebar
              selectedPerson={patientProfile.selectedPerson}
              onPatientChange={patientProfile.handlePatientChange}
              patientList={patientProfile.patientList}
              fromDate={doctorSearch.fromDate}
              toDate={doctorSearch.toDate}
              onRangeChange={handleRangeChange}
              disabledDate={doctorSearch.disabledDate}
              onEditPatient={patientProfile.openEditModal}
              onDeletePatient={patientProfile.handleDeletePatient}
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
                  value={doctorSearch.inputSearch}
                  onChange={(e) => doctorSearch.setInputSearch(e.target.value)}
                />
                <div className="my-2 flex justify-start gap-2">
                  <Button size="large" icon={<UserOutlined />}>
                    Tìm thấy{" "}
                    <span className="font-semibold">
                      {doctorSearch.data?.meta?.total ?? doctors.length} bác sĩ
                    </span>{" "}
                    phù hợp
                  </Button>
                  <Button size="large" onClick={handleReset}>
                    Xóa bộ lọc
                  </Button>
                </div>
              </div>

              {/* Danh sách bác sĩ */}
              {!booking.selectedDoctor && (
                <>
                  <DoctorList
                    doctors={doctors}
                    isFetching={doctorSearch.isFetching}
                    handleDoctorSelect={booking.handleDoctorSelect}
                  />
                  <div className="mt-4 flex justify-end">
                    <Pagination
                      current={doctorSearch.currentPage}
                      pageSize={
                        doctorSearch.data?.meta?.limit ?? doctorSearch.pageSize
                      }
                      total={doctorSearch.data?.meta?.total ?? doctors.length}
                      onChange={(page) => {
                        doctorSearch.setCurrentPage(page);
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
                  booking.handleConfirmBooking(patientProfile.selectedPerson)
                }
              />
            </Card>
          </div>
        </div>
      </div>

      {/* Modal thêm/sửa hồ sơ bệnh nhân */}
      <AddPatientModal
        visible={patientProfile.showAddPatientModal}
        onCancel={patientProfile.closeModal}
        onSubmit={patientProfile.handleAddPatient}
        confirmLoading={
          patientProfile.isCreatingPatient || patientProfile.isUpdatingPatient
        }
        editingPatient={patientProfile.editingPatient}
        isEditing={patientProfile.isEditing}
      />
    </div>
  );
};

export default BookingAppointmentPage;
