import { Button, DatePicker, Input, Select } from "antd";
import type { Dayjs } from "dayjs";
import type { AppointmentStatus } from "../../types/Booking";
import type { Doctor } from "../../types/Doctor";
import {
  FILTERABLE_STATUSES,
  PAYMENT_STATUS_MAP,
  STATUS_MAP,
} from "../../constants/AppointmentManagement/appointmentAdminConstants";

const { RangePicker } = DatePicker;

interface AppointmentFilterBarProps {
  dateRange: [Dayjs | null, Dayjs | null] | null;
  statusFilters: AppointmentStatus[];
  paymentStatusFilters: string[];
  doctorFilter: string | undefined;
  patientKeyword: string;
  doctors: Doctor[];
  loading: boolean;
  onDateRangeChange: (values: [Dayjs | null, Dayjs | null] | null) => void;
  onStatusFiltersChange: (values: AppointmentStatus[]) => void;
  onPaymentStatusFiltersChange: (values: string[]) => void;
  onDoctorFilterChange: (value: string | undefined) => void;
  onPatientKeywordChange: (value: string) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

const AppointmentFilterBar = ({
  dateRange,
  statusFilters,
  paymentStatusFilters,
  doctorFilter,
  patientKeyword,
  doctors,
  loading,
  onDateRangeChange,
  onStatusFiltersChange,
  onPaymentStatusFiltersChange,
  onDoctorFilterChange,
  onPatientKeywordChange,
  onApplyFilters,
  onResetFilters,
}: AppointmentFilterBarProps) => {
  return (
    <div
      style={{
        marginBottom: 16,
        display: "grid",
        gap: 12,
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      }}
    >
      <RangePicker
        value={dateRange}
        onChange={(values) =>
          onDateRangeChange(values as [Dayjs | null, Dayjs | null] | null)
        }
        format="DD/MM/YYYY"
        allowClear
      />

      <Select
        mode="multiple"
        allowClear
        placeholder="Trạng thái lịch"
        value={statusFilters}
        onChange={(values) =>
          onStatusFiltersChange(values as AppointmentStatus[])
        }
        options={FILTERABLE_STATUSES.map((status) => ({
          value: status,
          label: STATUS_MAP[status].text,
        }))}
      />

      <Select
        mode="multiple"
        allowClear
        placeholder="Trạng thái thanh toán"
        value={paymentStatusFilters}
        onChange={(values) => onPaymentStatusFiltersChange(values)}
        options={Object.entries(PAYMENT_STATUS_MAP).map(([value, config]) => ({
          value,
          label: config.text,
        }))}
      />

      <Select
        showSearch
        allowClear
        placeholder="Lọc theo bác sĩ"
        value={doctorFilter}
        onChange={(value) => onDoctorFilterChange(value)}
        optionFilterProp="label"
        options={doctors.map((doctor) => ({
          value: doctor._id,
          label: doctor.name,
        }))}
      />

      <Input
        allowClear
        placeholder="Tìm bệnh nhân (tên, sđt, CCCD, email)"
        value={patientKeyword}
        onChange={(e) => onPatientKeywordChange(e.target.value)}
        onPressEnter={onApplyFilters}
      />

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button type="primary" loading={loading} onClick={onApplyFilters}>
          Áp dụng lọc
        </Button>
        <Button onClick={onResetFilters}>Xóa lọc</Button>
      </div>
    </div>
  );
};

export default AppointmentFilterBar;
