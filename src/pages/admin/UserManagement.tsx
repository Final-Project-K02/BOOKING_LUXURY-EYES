import { Avatar, Select, Switch, Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import api from "../../api";

type UserRole = "USER" | "DOCTOR" | "ADMIN";
type UserStatus = "ACTIVE" | "BLOCKED";

interface User {
  _id: string;
  fullName?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  avatar?: string;
}

const ROLE_MAP: Record<UserRole, { text: string; color: string }> = {
  USER: { text: "Người dùng", color: "blue" },
  DOCTOR: { text: "Bác sĩ", color: "green" },
  ADMIN: { text: "Admin", color: "red" },
};

const STATUS_MAP: Record<UserStatus, { text: string; color: string }> = {
  ACTIVE: { text: "Hoạt động", color: "green" },
  BLOCKED: { text: "Bị khoá", color: "red" },
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data.data || []);
    } catch {
      message.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (id: string, role: UserRole) => {
    try {
      await api.put(`/users/${id}/role`, { role });
      message.success("Cập nhật vai trò thành công");
      fetchUsers();
    } catch {
      message.error("Cập nhật vai trò thất bại");
    }
  };

  const updateStatus = async (id: string, status: UserStatus) => {
    try {
      await api.put(`/users/${id}/status`, { status });
      message.success("Cập nhật trạng thái thành công");
      fetchUsers();
    } catch {
      message.error("Cập nhật trạng thái thất bại");
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: "Người dùng",
      key: "user",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar src={record.avatar}>
            {record.fullName?.charAt(0) || "U"}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.fullName || "Chưa có tên"}
            </div>
            <div style={{ fontSize: 12, color: "#888" }}>
              {record.email || "---"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role?: UserRole) => {
        const data = role ? ROLE_MAP[role] : null;
        return (
          <Tag color={data?.color || "default"}>
            {data?.text || "Không xác định"}
          </Tag>
        );
      },
    },
    {
      title: "Đổi vai trò",
      key: "changeRole",
      render: (_, record) => (
        <Select
          value={record.role}
          style={{ width: 140 }}
          onChange={(value: UserRole) =>
            updateRole(record._id, value)
          }
        >
          {(Object.keys(ROLE_MAP) as UserRole[]).map((role) => (
            <Select.Option key={role} value={role}>
              {ROLE_MAP[role].text}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status?: UserStatus) => {
        const data = status ? STATUS_MAP[status] : null;
        return (
          <Tag color={data?.color || "default"}>
            {data?.text || "Không xác định"}
          </Tag>
        );
      },
    },
    {
      title: "Khoá tài khoản",
      key: "lock",
      render: (_, record) => (
        <Switch
          checked={record.status === "ACTIVE"}
          checkedChildren="Mở"
          unCheckedChildren="Khoá"
          onChange={(checked) =>
            updateStatus(
              record._id,
              checked ? "ACTIVE" : "BLOCKED"
            )
          }
        />
      ),
    },
  ];

  return (
    <Table<User>
      rowKey="_id"
      loading={loading}
      columns={columns}
      dataSource={users}
    />
  );
};

export default UserManagement;
