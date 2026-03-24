import { useEffect } from "react";
import AppointmentFilterBar from "../../components/AppointmentManagement/AppointmentFilterBar";
import AppointmentTable from "../../components/AppointmentManagement/AppointmentTable";
import AppointmentDetailModal from "../../components/AppointmentManagement/AppointmentDetailModal";
import AppointmentCancelModal from "../../components/AppointmentManagement/AppointmentCancelModal";
import { useAppointmentList } from "../../hooks/AppointmentManagement/useAppointmentList";
import { useAppointmentFilters } from "../../hooks/AppointmentManagement/useAppointmentFilters";
import { useAppointmentActions } from "../../hooks/AppointmentManagement/useAppointmentActions";

const AppointmentManagement = () => {
  const {
    appointments,
    doctors,
    loading,
    detailLoading,
    setDetailLoading,
    fetchAppointments,
    fetchDoctors,
    fetchAppointmentDetail,
  } = useAppointmentList();

  const {
    searchParams,
    dateRange,
    setDateRange,
    statusFilters,
    setStatusFilters,
    paymentStatusFilters,
    setPaymentStatusFilters,
    doctorFilter,
    setDoctorFilter,
    patientKeyword,
    setPatientKeyword,
    buildFilterParams,
    getFiltersFromSearchParams,
    applyFiltersToState,
    handleApplyFilters,
    handleResetFilters,
  } = useAppointmentFilters();

  const {
    selectedAppointment,
    detailModalVisible,
    cancelConfirmVisible,
    appointmentToCancel,
    adminCancelNote,
    setAdminCancelNote,
    cancelOption,
    setCancelOption,
    submittingCancel,
    handleViewDetail,
    handleCloseDetail,
    confirmUpdateStatus,
    handleCloseCancelConfirm,
    handleConfirmCancelStatus,
    confirmUpdatePaymentStatus,
  } = useAppointmentActions({
    fetchAppointments: () => fetchAppointments(buildFilterParams()),
    fetchAppointmentDetail,
    setDetailLoading,
  });

  useEffect(() => {
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const filtersFromUrl = getFiltersFromSearchParams();
    applyFiltersToState(filtersFromUrl);
    fetchAppointments(buildFilterParams(filtersFromUrl));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <>
      <AppointmentFilterBar
        dateRange={dateRange}
        statusFilters={statusFilters}
        paymentStatusFilters={paymentStatusFilters}
        doctorFilter={doctorFilter}
        patientKeyword={patientKeyword}
        doctors={doctors}
        loading={loading}
        onDateRangeChange={setDateRange}
        onStatusFiltersChange={setStatusFilters}
        onPaymentStatusFiltersChange={setPaymentStatusFilters}
        onDoctorFilterChange={setDoctorFilter}
        onPatientKeywordChange={setPatientKeyword}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />

      <AppointmentTable
        appointments={appointments}
        loading={loading}
        onViewDetail={handleViewDetail}
        onUpdateStatus={confirmUpdateStatus}
        onUpdatePaymentStatus={confirmUpdatePaymentStatus}
        onReload={() => fetchAppointments(buildFilterParams())}
      />

      <AppointmentDetailModal
        open={detailModalVisible}
        appointment={selectedAppointment}
        detailLoading={detailLoading}
        onClose={handleCloseDetail}
      />

      <AppointmentCancelModal
        open={cancelConfirmVisible}
        appointment={appointmentToCancel}
        adminNote={adminCancelNote}
        cancelOption={cancelOption}
        confirmLoading={submittingCancel}
        onAdminNoteChange={setAdminCancelNote}
        onCancelOptionChange={setCancelOption}
        onConfirm={handleConfirmCancelStatus}
        onClose={handleCloseCancelConfirm}
      />
    </>
  );
};

export default AppointmentManagement;
