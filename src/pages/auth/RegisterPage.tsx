import { MailOutlined, UserOutlined, LockOutlined } from "@ant-design/icons";
import { Form, Input, message, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../api";
import type { User } from "../../types/User";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "../../types/ApiResponse";

interface RegisterPageProps {
  open: boolean;
  onClose: () => void;
}

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]+$/;

const RegisterPage = ({ open, onClose }: RegisterPageProps) => {
  const nav = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (values: User) => {
    try {
      setLoading(true);
      const payload = {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      };

      await api.post("/auth/register", payload);
      message.success("Đăng ký thành công");
      form.resetFields();
      onClose();
      nav("/auth/login");
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;

      const errorMessage = err.response?.data?.message || "Đăng ký thất bại";

      message.error(errorMessage);

      console.error("Register Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Đăng ký tài khoản"
      open={open}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Đăng ký"
      cancelText="Hủy"
      width={500}
      onOk={() => form.submit()}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleRegister}
        disabled={loading}
      >
        {/* Họ và tên */}
        <Form.Item
          name="fullName"
          label="Họ và tên"
          normalize={(value) => value?.trim()}
          rules={[
            { required: true, message: "Vui lòng nhập họ và tên" },
            { min: 6, message: "Họ và tên tối thiểu 6 ký tự" },
          ]}
        >
          <Input
            size="large"
            placeholder="Nguyễn Văn A"
            prefix={<UserOutlined />}
          />
        </Form.Item>

        {/* Email */}
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input
            size="large"
            placeholder="nguyenvana@gmail.com"
            prefix={<MailOutlined />}
          />
        </Form.Item>

        {/* Password */}
        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu" },
            { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" },
            {
              pattern: PASSWORD_REGEX,
              message:
                "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt",
            },
          ]}
        >
          <Input.Password
            size="large"
            placeholder="Nhập mật khẩu"
            prefix={<LockOutlined />}
          />
        </Form.Item>

        {/* Confirm Password */}
        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu" },
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
      </Form>
    </Modal>
  );
};

export default RegisterPage;
