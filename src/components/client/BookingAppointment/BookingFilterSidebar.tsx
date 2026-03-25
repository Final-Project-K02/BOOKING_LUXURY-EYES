import { CalendarOutlined } from "@ant-design/icons";
import { Button, Card, DatePicker, Select } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type { PatientResponse } from "../../../types/PatientProfile";

const { RangePicker } = DatePicker;

interface BookingFilterSidebarProps {
  selectedPerson: string;
  onPatientChange: (value: string) => void;
  patientList: PatientResponse[];
  fromDate: string;
  toDate: string;
  onRangeChange: (dates: (Dayjs | null)[] | null) => void;
  disabledDate: (current: Dayjs) => boolean;
  onEditPatient: (patient: PatientResponse) => void;
  onDeletePatient: (id: string) => void;
}

/**
 * Panel trái: chọn hồ sơ bệnh nhân + lọc theo khoảng ngày.
 */
const BookingFilterSidebar = ({
  selectedPerson,
  onPatientChange,
  patientList,
  fromDate,
  toDate,
  onRangeChange,
  disabledDate,
  onEditPatient,
  onDeletePatient,
}: BookingFilterSidebarProps) => {
  return (
    <Card className="shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <CalendarOutlined className="text-blue-600 text-xl" />
        <h2 className="text-lg font-semibold text-gray-800">
          Thông tin đặt khám
        </h2>
      </div>

      {/* Chọn bệnh nhân */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Người tới khám (*)
        </label>
        <Select
          value={selectedPerson}
          onChange={onPatientChange}
          className="w-full"
          size="large"
          placeholder="Tìm kiếm..."
          showSearch
          filterOption={(input, option) => {
            const label = option?.label;
            if (typeof label === "string") {
              return label.toLowerCase().includes(input.toLowerCase());
            }
            return false;
          }}
        >
          <Select.OptGroup label="Danh sách hồ sơ">
            {patientList.map((patient) => (
              <Select.Option
                key={patient._id}
                value={patient._id}
                label={patient.fullName}
              >
                <div className="flex justify-between items-center gap-2">
                  <span>{patient.fullName}</span>
                  <div
                    className="flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      size="small"
                      type="link"
                      onClick={() => onEditPatient(patient)}
                    >
                      Sửa
                    </Button>
                    <Button
                      size="small"
                      type="link"
                      danger
                      onClick={() => onDeletePatient(patient._id)}
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              </Select.Option>
            ))}
            <Select.Option
              value="add-new"
              className="text-blue-600 font-semibold"
            >
              + Thêm mới người bệnh
            </Select.Option>
          </Select.OptGroup>
        </Select>
      </div>

      {/* Chọn khoảng ngày */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn ngày khám
        </label>
        <RangePicker
          placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
          className="w-full"
          size="large"
          disabledDate={disabledDate}
          value={
            fromDate && toDate
              ? [dayjs(fromDate, "YYYY-MM-DD"), dayjs(toDate, "YYYY-MM-DD")]
              : undefined
          }
          onChange={onRangeChange}
        />
      </div>
    </Card>
  );
};

export default BookingFilterSidebar;
