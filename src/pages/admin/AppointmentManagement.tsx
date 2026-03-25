import AppointmentFilterBar from "../../components/AppointmentManagement/AppointmentFilterBar";
import AppointmentTable from "../../components/AppointmentManagement/AppointmentTable";
import AppointmentDetailModal from "../../components/AppointmentManagement/AppointmentDetailModal";
import AppointmentCancelModal from "../../components/AppointmentManagement/AppointmentCancelModal";
import { useAppointmentManagement } from "../../hooks/AppointmentManagement/useAppointmentManagement";

const AppointmentManagement = () => {
  const am = useAppointmentManagement();

  return (
    <>
      <AppointmentFilterBar
        dateRange={am.dateRange}
        statusFilters={am.statusFilters}
        paymentStatusFilters={am.paymentStatusFilters}
        doctorFilter={am.doctorFilter}
        patientKeyword={am.patientKeyword}
        doctors={am.doctors}
        loading={am.loading}
        onDateRangeChange={am.setDateRange}
        onStatusFiltersChange={am.setStatusFilters}
        onPaymentStatusFiltersChange={am.setPaymentStatusFilters}
        onDoctorFilterChange={am.setDoctorFilter}
        onPatientKeywordChange={am.setPatientKeyword}
        onApplyFilters={am.handleApplyFilters}
        onResetFilters={am.handleResetFilters}
      />

      <AppointmentTable
        appointments={am.appointments}
        loading={am.loading}
        onViewDetail={am.handleViewDetail}
        onUpdateStatus={am.confirmUpdateStatus}
        onUpdatePaymentStatus={am.confirmUpdatePaymentStatus}
        onReload={am.reload}
      />

      <AppointmentDetailModal
        open={am.detailModalVisible}
        appointment={am.selectedAppointment}
        detailLoading={am.detailLoading}
        onClose={am.handleCloseDetail}
      />

      <AppointmentCancelModal
        open={am.cancelConfirmVisible}
        appointment={am.appointmentToCancel}
        adminNote={am.adminCancelNote}
        cancelOption={am.cancelOption}
        confirmLoading={am.submittingCancel}
        onAdminNoteChange={am.setAdminCancelNote}
        onCancelOptionChange={am.setCancelOption}
        onConfirm={am.handleConfirmCancelStatus}
        onClose={am.handleCloseCancelConfirm}
      />
    </>
  );
};

export default AppointmentManagement;
