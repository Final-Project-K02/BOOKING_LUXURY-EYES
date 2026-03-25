import { PlusOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Image,
  Popconfirm,
  Space,
  Table,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import DoctorFilterBar from "../../components/admin/DoctorManagement/DoctorFilterBar";
import DoctorFormModal from "../../components/admin/DoctorManagement/DoctorFormModal";
import useDoctorManagement from "../../hooks/DoctorManagement/useDoctorManagement";
import type { Doctor } from "../../types/Doctor";

const DoctorManagement: React.FC = () => {
  const {
    doctors,
    loading,
    openModal,
    editingDoctor,
    uploadingAvatar,
    filters,
    form,
    uploadProps,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseModal,
    handleSubmit,
    handleDelete,
    handleToggleStatus,
    handleFilterChange,
    handleFilterReset,
    fetchDoctors,
  } = useDoctorManagement();

  const columns: ColumnsType<Doctor> = [
    {
      title: "Tên bác sĩ",
      dataIndex: "name",
      width: 160,
      ellipsis: true,
    },
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

        return (
          <Avatar size={48}>{record?.name?.[0]?.toUpperCase() || "?"}</Avatar>
        );
      },
    },
    {
      title: "Giá khám",
      dataIndex: "price",
      width: 130,
      render: (price: number) => `${price.toLocaleString()} đ`,
    },
    {
      title: "Kinh nghiệm",
      dataIndex: "experience_year",
      width: 120,
      render: (year: number) => `${year} năm`,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      width: 180,
      ellipsis: true,
      render: (text) => text || "—",
    },
    {
      title: "Email",
      dataIndex: "email",
      width: 220,
      render: (text: string) =>
        text ? (
          <Tooltip title={text}>
            <span
              style={{
                display: "inline-block",
                maxWidth: 200,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {text}
            </span>
          </Tooltip>
        ) : (
          "—"
        ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      width: 140,
      render: (text: string) => text || "—",
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      width: 150,
      render: (active) =>
        active ? (
          <span style={{ color: "green" }}>Đang hoạt động</span>
        ) : (
          <span style={{ color: "red" }}>Đã tắt</span>
        ),
    },

    {
      title: "Hành động",
      width: 210,
      render: (_, record) => (
        <Space size="small" wrap>
          {/* Sửa */}
          <Button type="link" onClick={() => handleOpenEdit(record)}>
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
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd}>
          Thêm bác sĩ
        </Button>
      }
    >
      <DoctorFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleFilterReset}
        onSearch={fetchDoctors}
      />

      <Table
        rowKey="_id"
        loading={loading}
        columns={columns}
        dataSource={doctors}
        scroll={{ x: 1400 }}
      />

      <DoctorFormModal
        open={openModal}
        editingDoctor={editingDoctor}
        form={form}
        uploadingAvatar={uploadingAvatar}
        uploadProps={uploadProps}
        onCancel={handleCloseModal}
        onFinish={handleSubmit}
      />
    </Card>
  );
};

export default DoctorManagement;
