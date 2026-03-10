import { PlusOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Form,
  Image,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
  Upload,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UploadProps } from "antd";
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
  description?: string;
  email?: string;
  phone?: string;
}

const DoctorManagement: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [form] = Form.useForm<DoctorFormValues>();
  const [filters, setFilters] = useState<DoctorFilter>({});

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleToggleStatus = async (doctor: Doctor) => {
    try {
      await api.patch(`/doctors/${doctor._id}/status`);
      message.success(
        doctor.is_active ? "Tắt bác sĩ thành công" : "Bật bác sĩ thành công"
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

  // Upload avatar to backend -> Cloudinary
  const uploadDoctorAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", "booking-app/doctors");

    // Nếu baseURL của api đã là .../api thì để "/uploads/image"
    // Nếu baseURL không có /api thì đổi thành "/api/uploads/image"
    const res = await api.post("/uploads/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data?.data?.url as string;
  };

  const uploadProps: UploadProps = {
    accept: "image/*",
    showUploadList: false,
    beforeUpload: async (file) => {
      try {
        setUploadingAvatar(true);

        // Optional: check file size client-side
        const maxSize = 5 * 1024 * 1024;
        if ((file as File).size > maxSize) {
          message.error("Ảnh quá lớn (tối đa 5MB)");
          return Upload.LIST_IGNORE;
        }

        const url = await uploadDoctorAvatar(file as File);

        if (!url) {
          message.error("Upload thất bại: không nhận được url");
          return Upload.LIST_IGNORE;
        }

        form.setFieldValue("avatar", url);
        message.success("Upload avatar thành công");
      } catch (err: any) {
        message.error(err?.response?.data?.message || "Upload thất bại");
      } finally {
        setUploadingAvatar(false);
      }

      // chặn Upload tự upload
      return false;
    },
  };

  const columns: ColumnsType<Doctor> = [
    
    { title: "Tên bác sĩ", dataIndex: "name" },
    {
  title: "Ảnh",
  dataIndex: "avatar",
  width: 90,
  render: (avatarUrl: string | undefined, record: Doctor) => {
    if (avatarUrl) {
      return (
        <Image
          src={avatarUrl}
          width={48}
          height={48}
          style={{ objectFit: "cover", borderRadius: 8 }}
          preview={{ src: avatarUrl }}
          fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='100%25' height='100%25' fill='%23eee'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='10'%3ENo%3C/text%3E%3C/svg%3E"
        />
      );
    }

    return <Avatar size={48}>{record?.name?.[0]?.toUpperCase() || "?"}</Avatar>;
  },
},
    {
      title: "Giá khám",
      dataIndex: "price",
      render: (price: number) => `${price.toLocaleString()} đ`,
    },
    {
      title: "Kinh nghiệm",
      dataIndex: "experience_year",
      render: (year: number) => `${year} năm`,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      ellipsis: true,
      render: (text: string) => text || "—",
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (text: string) => text || "—",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      render: (text: string) => text || "—",
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      render: (active: boolean) =>
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
          <Button
            type="link"
            onClick={() => {
              setEditingDoctor(record);
              form.setFieldsValue(record);
              setOpenModal(true);
            }}
          >
            Sửa
          </Button>

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
          }}
        >
          Thêm bác sĩ
        </Button>
      }
    >
      <Form layout="inline" style={{ marginBottom: 16 }} onFinish={fetchDoctors}>
        <Form.Item label="Tên bác sĩ">
          <Input
            placeholder="Nhập tên..."
            allowClear
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
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
        okButtonProps={{ disabled: uploadingAvatar }}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item label="Tên bác sĩ" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          {/* Avatar with upload + preview */}
          <Form.Item label="Avatar" name="avatar">
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <Input placeholder="Hoặc dán URL avatar..." />
                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                  <Upload {...uploadProps}>
                    <Button loading={uploadingAvatar}>Chọn ảnh</Button>
                  </Upload>

                  <Button
                    onClick={() => form.setFieldValue("avatar", "")}
                    disabled={uploadingAvatar}
                  >
                    Xóa
                  </Button>
                </div>
                <div style={{ marginTop: 6, fontSize: 12, color: "#888" }}>
                  Hỗ trợ JPG/PNG/WEBP, tối đa 5MB
                </div>
              </div>

              <div style={{ width: 90 }}>
                {form.getFieldValue("avatar") ? (
                  <Image
                    src={form.getFieldValue("avatar")}
                    width={90}
                    height={90}
                    style={{ objectFit: "cover", borderRadius: 8 }}
                    fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Crect width='100%25' height='100%25' fill='%23eee'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E"
                  />
                ) : (
                  <div
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: 8,
                      background: "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#999",
                      fontSize: 12,
                    }}
                  >
                    No Image
                  </div>
                )}
              </div>
            </div>
          </Form.Item>

          <Form.Item label="Giá khám" name="price" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>

          <Form.Item label="Email" name="email">
            <Input />
          </Form.Item>

          <Form.Item label="Số điện thoại" name="phone">
            <Input />
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