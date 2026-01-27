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

/* ================= TYPES ================= */

interface Doctor {
  _id: string;
  name: string;
  avatar?: string;
  specialty: string;
  price: number;
  experience_year: number;
  description?: string;
}

interface DoctorFormValues {
  name: string;
  avatar?: string;
  specialty: string;
  price: number;
  experience_year: number;
  description?: string;
}

/* ================= COMPONENT ================= */

const DoctorManagement: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  const [form] = Form.useForm<DoctorFormValues>();

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: Doctor[] }>("/doctors");
      setDoctors(res.data.data ?? []);
    } catch {
      message.error("Không thể tải danh sách bác sĩ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

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
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              setEditingDoctor(record);
              form.setFieldsValue({
                name: record.name,
                avatar: record.avatar,
                specialty: record.specialty,
                price: record.price,
                experience_year: record.experience_year,
                description: record.description,
              });
              setOpenModal(true);
            }}
          >
            Sửa
          </Button>

          <Popconfirm
            title="Bạn chắc chắn muốn xoá?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button type="link" danger>
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
          }}
        >
          Thêm bác sĩ
        </Button>
      }
    >
      <Table rowKey="_id" loading={loading} columns={columns} dataSource={doctors} />

      <Modal
        destroyOnClose
        open={openModal}
        title={editingDoctor ? "Cập nhật bác sĩ" : "Thêm bác sĩ"}
        onCancel={() => setOpenModal(false)}
        onOk={() => form.submit()}
        okText="Lưu"
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item label="Tên bác sĩ" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Avatar" name="avatar">
            <Input />
          </Form.Item>

     

          <Form.Item label="Giá khám" name="price" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>

          <Form.Item
            label="Số năm kinh nghiệm"
            name="experience_year"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
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
