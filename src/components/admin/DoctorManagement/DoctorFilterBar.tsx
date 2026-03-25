import { Button, Form, Input, InputNumber, Space } from "antd";
import type { DoctorFilter } from "../../../types/Doctor";

interface Props {
  filters: DoctorFilter;
  onFilterChange: (changed: Partial<DoctorFilter>) => void;
  onReset: () => void;
  onSearch: () => void;
}

const DoctorFilterBar: React.FC<Props> = ({
  filters,
  onFilterChange,
  onReset,
  onSearch,
}) => {
  return (
    <Form layout="inline" style={{ marginBottom: 16 }} onFinish={onSearch}>
      <Form.Item label="Tên bác sĩ">
        <Input
          placeholder="Nhập tên..."
          allowClear
          value={filters.keyword ?? ""}
          onChange={(e) => onFilterChange({ keyword: e.target.value })}
        />
      </Form.Item>

      <Form.Item label="Giá từ">
        <InputNumber
          min={0}
          placeholder="Min"
          value={filters.minPrice}
          onChange={(value) => onFilterChange({ minPrice: value ?? undefined })}
        />
      </Form.Item>

      <Form.Item label="đến">
        <InputNumber
          min={0}
          placeholder="Max"
          value={filters.maxPrice}
          onChange={(value) => onFilterChange({ maxPrice: value ?? undefined })}
        />
      </Form.Item>

      <Form.Item label="Kinh nghiệm ≥">
        <InputNumber
          min={0}
          placeholder="Năm"
          value={filters.experience_year}
          onChange={(value) =>
            onFilterChange({ experience_year: value ?? undefined })
          }
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            Lọc
          </Button>
          <Button onClick={onReset}>Reset</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default DoctorFilterBar;
