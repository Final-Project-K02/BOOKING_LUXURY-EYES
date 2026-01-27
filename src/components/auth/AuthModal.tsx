import {
  MailOutlined,
  UserOutlined,
  LockOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { Form, Input, Modal, Button, Space } from "antd";
import { useState, useEffect } from "react";
import { PASSWORD_REGEX } from "../../app/services/authApi";
import type {
  AuthModalProps,
  AuthMode,
  ForgotPasswordPayload,
} from "../../types/Auth";
import type { LoginPayload, User } from "../../types/User";
import { useAuthHandler } from "../../hooks/useAuthHandler";

// ===== VALIDATION RULES =====
const getFullNameRules = () => [
  { required: true, message: "Vui lòng nhập họ và tên" },
  { min: 6, message: "Họ và tên tối thiểu 6 ký tự" },
];

const getEmailRules = () => [
  { required: true, message: "Vui lòng nhập email" },
  { type: "email" as const, message: "Email không hợp lệ" },
];

const getPasswordRules = () => {
  const baseRules = [{ required: true, message: "Vui lòng nhập mật khẩu" }];

  // if (!isRegister) {
  //   return baseRules;
  // }

  return [
    ...baseRules,
    { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" },
    {
      pattern: PASSWORD_REGEX,
      message:
        "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt",
    },
  ];
};

const getConfirmPasswordRules = () => [
  { required: true, message: "Vui lòng xác nhận mật khẩu" },
];

// ===== COMPONENT =====
const AuthModal = ({ open, onClose, mode: initialMode }: AuthModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<AuthMode>(initialMode);
  const { handleRegister, handleLogin, handleForgotPassword } =
    useAuthHandler();

  // Cập nhật currentMode khi initialMode thay đổi (từ HeaderClient)
  useEffect(() => {
    if (open) {
      setCurrentMode(initialMode);
      form.resetFields();
    }
  }, [open, initialMode, form]);

  // Reset form khi thay đổi chế độ
  const switchMode = (newMode: AuthMode) => {
    form.resetFields();
    setCurrentMode(newMode);
  };

  const isRegisterMode = currentMode === "register";
  const isLoginMode = currentMode === "login";
  const isForgotMode = currentMode === "forgot";

  const handleSubmit = async (
    values: User | LoginPayload | ForgotPasswordPayload,
  ) => {
    try {
      setLoading(true);
      let success = false;

      switch (currentMode) {
        case "register":
          success = await handleRegister(values as User);
          break;
        case "login":
          success = await handleLogin(values as LoginPayload);
          break;
        case "forgot":
          success = await handleForgotPassword(values as ForgotPasswordPayload);
          break;
      }

      if (success) {
        form.resetFields();
        if (currentMode === "login") {
          onClose();
        } else if (currentMode === "forgot") {
          switchMode("login");
        } else if (currentMode === "register") {
          // Sau khi đăng ký thành công, chuyển sang login (nhưng không đóng modal)
          switchMode("login");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setCurrentMode(initialMode);
    onClose();
  };

  const goBack = () => {
    switchMode("login");
  };

  const getModalTitle = () => {
    switch (currentMode) {
      case "register":
        return "Đăng ký tài khoản";
      case "forgot":
        return "Quên mật khẩu";
      default:
        return "Đăng nhập";
    }
  };

  const getOkText = () => {
    switch (currentMode) {
      case "register":
        return "Đăng ký";
      case "forgot":
        return "Gửi liên kết";
      default:
        return "Đăng nhập";
    }
  };

  return (
    <Modal
      title={getModalTitle()}
      open={open}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={getOkText()}
      cancelText="Hủy"
      width={500}
      onOk={() => form.submit()}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={loading}
      >
        {/* Họ và tên (chỉ cho register) */}
        {isRegisterMode && (
          <Form.Item
            name="fullName"
            label="Họ và tên"
            normalize={(value) => value?.trim()}
            rules={getFullNameRules()}
          >
            <Input
              size="large"
              placeholder="Nguyễn Văn A"
              prefix={<UserOutlined />}
            />
          </Form.Item>
        )}

        {/* Email (chung cho cả ba) */}
        <Form.Item name="email" label="Email" rules={getEmailRules()}>
          <Input
            size="large"
            placeholder="Nhập email"
            prefix={<MailOutlined />}
          />
        </Form.Item>

        {/* Password (chỉ cho login và register) */}
        {!isForgotMode && (
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={getPasswordRules()}
          >
            <Input.Password
              size="large"
              placeholder="Nhập mật khẩu"
              prefix={<LockOutlined />}
            />
          </Form.Item>
        )}

        {/* Confirm Password (chỉ cho register) */}
        {isRegisterMode && (
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={["password"]}
            rules={[
              ...getConfirmPasswordRules(),
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp"),
                  );
                },
              }),
            ]}
          >
            <Input.Password
              size="large"
              placeholder="Xác nhận mật khẩu"
              prefix={<LockOutlined />}
            />
          </Form.Item>
        )}

        {/* Footer links */}
        {isLoginMode && (
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Button type="link" onClick={() => setCurrentMode("forgot")}>
              Quên mật khẩu?
            </Button>
            <Button type="link" onClick={() => setCurrentMode("register")}>
              Tạo tài khoản mới
            </Button>
          </Space>
        )}

        {!isLoginMode && (
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={goBack}
            style={{ width: "100%" }}
          >
            Quay lại đăng nhập
          </Button>
        )}
      </Form>
    </Modal>
  );
};

export default AuthModal;
