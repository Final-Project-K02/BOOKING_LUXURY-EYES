import { Avatar, Select, Switch, Table, Tag, message as staticMessage, App as AntdApp } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useAppSelector } from "../../app/hook";
import {
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  type AdminUser as User,
  type UserRole,
  type UserStatus,
} from "../../app/services/userApi";

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
  // ===== HOOKS =====
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let message: any = staticMessage;
  try {
    const app = AntdApp.useApp();
    if (app?.message) {
      message = app.message;
    }
  } catch {
    message = staticMessage;
  }

  const { data, isLoading } = useGetUsersQuery();
  const [updateRole] = useUpdateUserRoleMutation();
  const [updateStatus] = useUpdateUserStatusMutation();
  const users: User[] = data?.data || [];
  const currentUserId = useAppSelector((state) => state.auth.user?._id);

  const handleUpdateRole = async (id: string, role: UserRole) => {
    try {
      await updateRole({ id, role }).unwrap();
      message.success("Cập nhật vai trò thành công");
    } catch {
      message.error("Cập nhật vai trò thất bại");
    }
  };

  const handleUpdateStatus = async (id: string, status: UserStatus) => {
    try {
      await updateStatus({ id, status }).unwrap();
      message.success("Cập nhật trạng thái thành công");
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
          <Avatar src={record.avatar || undefined}>
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
          onChange={(value: UserRole) => handleUpdateRole(record._id, value)}
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
      render: (_, record) => {
        const isCurrentUser = !!currentUserId && currentUserId === record._id;

        return (
          <Switch
            checked={record.status === "ACTIVE"}
            checkedChildren="Mở"
            unCheckedChildren="Khoá"
            onChange={(checked) => {
              if (isCurrentUser && !checked) {
                message.warning("Không thể tự khóa chính mình");
                return;
              }

              handleUpdateStatus(record._id, checked ? "ACTIVE" : "BLOCKED");
            }}
          />
        );
      },
    },
  ];

  return (
    <Table<User>
      rowKey="_id"
      loading={isLoading}
      columns={columns}
      dataSource={users}
    />
  );
};

export default UserManagement;
