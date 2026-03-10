import { LockOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, message } from "antd";
import { useState } from "react";
import { PASSWORD_REGEX } from "../../app/services/authApi";
import { useAuthHandler } from "../../hooks/useAuthHandler";

interface ResetPasswordModalProps {
  open: boolean;
  token: string;
  onClose: () => void;
}

const ResetPasswordModal = ({
  open,
  token,
  onClose,
}: ResetPasswordModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { handleResetPassword } = useAuthHandler();

  const handleSubmit = async (values: {
    password: string;
    confirmPassword: string;
  }) => {
    if (!token) {
      message.error("Liên kết không hợp lệ hoặc đã hết hạn");
      return;
    }

    try {
      setLoading(true);
      const success = await handleResetPassword({
        token,
        password: values.password,
      });

      if (success) {
        form.resetFields();
        onClose();
      }
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
      title="Đặt lại mật khẩu"
      open={open}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Xác nhận"
      cancelText="Hủy"
      width={500}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={loading}
      >
        <Form.Item
          name="password"
          label="Mật khẩu mới"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới" },
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
            placeholder="Nhập mật khẩu mới"
            prefix={<LockOutlined />}
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu mới"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
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
            placeholder="Xác nhận mật khẩu mới"
            prefix={<LockOutlined />}
          />
        </Form.Item>

        <Button type="link" onClick={handleCancel} style={{ paddingLeft: 0 }}>
          Đóng cửa sổ này để quay lại trang chủ
        </Button>
      </Form>
    </Modal>
  );
};

export default ResetPasswordModal;
