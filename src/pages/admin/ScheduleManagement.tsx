import { useScheduleManagement } from "../../hooks/ScheduleManagement/useScheduleManagement";
import ScheduleTable from "../../components/admin/ScheduleManagement/ScheduleTable";
import ScheduleFormModal from "../../components/admin/ScheduleManagement/ScheduleFormModal";

const ScheduleManagement = () => {
  const {
    doctors,
    loading,
    displaySchedules,
    tempTimeSlots,
    form,
    editingSchedule,
    open,
    setOpen,
    doctorMap,
    doctorsWithSchedule,
    roomOptions,
    availableTimeOptions,
    scheduleViewMode,
    setScheduleViewMode,
    getVisibleSlots,
    disabledDate,
    handleDoctorChange,
    addTimeSlot,
    removeTempSlot,
    handleSubmit,
    handleDeleteSchedule,
    openCreateModal,
    openEditModal,
  } = useScheduleManagement();

  return (
    <>
      <ScheduleTable
        schedules={displaySchedules}
        loading={loading}
        doctorMap={doctorMap}
        scheduleViewMode={scheduleViewMode}
        getVisibleSlots={getVisibleSlots}
        onViewModeChange={setScheduleViewMode}
        onCreateNew={openCreateModal}
        onEdit={openEditModal}
        onDelete={handleDeleteSchedule}
      />
      <ScheduleFormModal
        open={open}
        editingSchedule={editingSchedule}
        tempTimeSlots={tempTimeSlots}
        form={form}
        doctors={doctors}
        doctorsWithSchedule={doctorsWithSchedule}
        roomOptions={roomOptions}
        availableTimeOptions={availableTimeOptions}
        disabledDate={disabledDate}
        onClose={() => setOpen(false)}
        onDoctorChange={handleDoctorChange}
        onAddTimeSlot={addTimeSlot}
        onRemoveSlot={removeTempSlot}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default ScheduleManagement;
