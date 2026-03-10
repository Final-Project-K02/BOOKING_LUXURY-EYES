import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import api from "../../api";

interface Doctor {
  _id: string;
  name: string;
  avatar?: string;
  price: number;
  is_active?: boolean;
  email?: string;
  phone?: string;
  experience_year: number;
  description?: string;
}

interface DoctorFilter {
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  experience_year?: number;
}

interface DoctorFormValues {
  name: string;
  avatar?: string;
  price: number;
  experience_year: number;
  email?: string;
  phone?: string;
  description?: string;
}

const DoctorManagement: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  const [form] = Form.useForm<DoctorFormValues>();
  const [filters, setFilters] = useState<DoctorFilter>({});

  const getPriceByExperience = (experienceYear: number): number => {
    if (experienceYear <= 3) return 150000;
    if (experienceYear <= 7) return 250000;
    if (experienceYear <= 15) return 350000;
    return 500000;
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);

      const res = await api.get<{ data: Doctor[] }>("/doctors/admin", {
        params: filters,
      });

      setDoctors(res.data.data ?? []);
    } catch {
      message.error("Không thể tải danh sách bác sĩ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [filters]);

  const handleToggleStatus = async (doctor: Doctor) => {
    try {
      await api.patch(`/doctors/${doctor._id}/status`);
      message.success(
        doctor.is_active ? "Tắt bác sĩ thành công" : "Bật bác sĩ thành công",
      );
      fetchDoctors();
    } catch {
      message.error("Bác sĩ có lịch khám sắp tới , không thể tắt");
    }
  };

  const handleSubmit = async (values: DoctorFormValues) => {
    try {
      if (editingDoctor) {
        await api.put(`/doctors/${editingDoctor._id}`, values);
        message.success("Cập nhật bác sĩ thành công");
      } else {
        await api.post("/doctors", values);
        message.success("Thêm bác sĩ thành công");
      }

      setOpenModal(false);
      setEditingDoctor(null);
      form.resetFields();
      fetchDoctors();
    } catch {
      message.error("Thao tác thất bại");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/doctors/${id}`);
      message.success("Xoá bác sĩ thành công");
      fetchDoctors();
    } catch {
      message.error("Xoá thất bại");
    }
  };

  const columns: ColumnsType<Doctor> = [
    { title: "Tên bác sĩ", dataIndex: "name" },
    {
      title: "Giá khám",
      dataIndex: "price",
      render: (price) => `${price.toLocaleString()} đ`,
    },
    {
      title: "Kinh nghiệm",
      dataIndex: "experience_year",
      render: (year) => `${year} năm`,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      ellipsis: true,
      render: (text) => text || "—",
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (text) => text || "—",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      render: (text) => text || "—",
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      render: (active) =>
        active ? (
          <span style={{ color: "green" }}>Đang hoạt động</span>
        ) : (
          <span style={{ color: "red" }}>Đã tắt</span>
        ),
    },

    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          {/* Sửa */}
          <Button
            type="link"
            onClick={() => {
              setEditingDoctor(record);
              const autoPrice = getPriceByExperience(record.experience_year);
              form.setFieldsValue({ ...record, price: autoPrice });
              setOpenModal(true);
            }}
          >
            Sửa
          </Button>

          {/* Tắt / Bật */}
          <Popconfirm
            title={
              record.is_active
                ? "Tắt bác sĩ này? (chỉ tắt khi không có lịch)"
                : "Bật lại bác sĩ này?"
            }
            onConfirm={() => handleToggleStatus(record)}
          >
            <Button type="link" danger={record.is_active}>
              {record.is_active ? "Tắt" : "Bật"}
            </Button>
          </Popconfirm>

          {/* Xoá – chỉ cho xoá khi đã tắt */}
          <Popconfirm
            title="Bạn chắc chắn muốn xoá?"
            onConfirm={() => handleDelete(record._id)}
            disabled={record.is_active}
          >
            <Button danger disabled={record.is_active}>
              Xoá
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Quản lý bác sĩ"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setOpenModal(true);
            setEditingDoctor(null);
            form.resetFields();
            form.setFieldsValue({ price: 150000 });
          }}
        >
          Thêm bác sĩ
        </Button>
      }
    >
      <Form
        layout="inline"
        style={{ marginBottom: 16 }}
        onFinish={() => fetchDoctors()}
      >
        <Form.Item label="Tên bác sĩ">
          <Input
            placeholder="Nhập tên..."
            allowClear
            onChange={(e) =>
              setFilters({ ...filters, keyword: e.target.value })
            }
          />
        </Form.Item>

        <Form.Item label="Giá từ">
          <InputNumber
            min={0}
            placeholder="Min"
            onChange={(value) =>
              setFilters({ ...filters, minPrice: value ?? undefined })
            }
          />
        </Form.Item>

        <Form.Item label="đến">
          <InputNumber
            min={0}
            placeholder="Max"
            onChange={(value) =>
              setFilters({ ...filters, maxPrice: value ?? undefined })
            }
          />
        </Form.Item>

        <Form.Item label="Kinh nghiệm ≥">
          <InputNumber
            min={0}
            placeholder="Năm"
            onChange={(value) =>
              setFilters({ ...filters, experience_year: value ?? undefined })
            }
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Lọc
            </Button>
            <Button
              onClick={() => {
                setFilters({});
                fetchDoctors();
              }}
            >
              Reset
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <Table
        rowKey="_id"
        loading={loading}
        columns={columns}
        dataSource={doctors}
      />

      <Modal
        destroyOnClose
        open={openModal}
        title={editingDoctor ? "Cập nhật bác sĩ" : "Thêm bác sĩ"}
        onCancel={() => setOpenModal(false)}
        onOk={() => form.submit()}
        okText="Lưu"
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleSubmit}
          onValuesChange={(changedValues, allValues) => {
            if (
              Object.prototype.hasOwnProperty.call(
                changedValues,
                "experience_year",
              )
            ) {
              const experienceYear = Number(allValues.experience_year ?? 0);
              if (!Number.isNaN(experienceYear)) {
                form.setFieldValue(
                  "price",
                  getPriceByExperience(experienceYear),
                );
              }
            }
          }}
          initialValues={{ price: 150000 }}
        >
          <Form.Item
            label="Tên bác sĩ"
            name="name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Avatar" name="avatar">
            <Input />
          </Form.Item>

          <Form.Item
            label="Số năm kinh nghiệm"
            name="experience_year"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>

          <Form.Item label="Giá khám" name="price" rules={[{ required: true }]}>
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              disabled
              formatter={(value) =>
                value ? `${Number(value).toLocaleString("vi-VN")} đ` : ""
              }
              parser={(value) => Number(value?.replace(/\D/g, "") ?? 0)}
            />
          </Form.Item>

          <Form.Item label="Email" name="email">
            <Input />
          </Form.Item>

          <Form.Item label="Số điện thoại" name="phone">
            <Input />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default DoctorManagement;
