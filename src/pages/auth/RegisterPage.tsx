import {
  IdcardOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Card, DatePicker, Form, Input, Radio } from "antd";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import type { User } from "../../types/User";


const RegisterPage = () => {
  const nav = useNavigate();

 const handleRegister = async (values: User) => {
  try {
    const payload = {
      fullName: values.fullName,
      dateOfBirth: values.dateOfBirth,
      gender: values.gender,
      identityCard: values.identityCard,
      email: values.email,
      phone: values.phone,
      address: values.address,
      password: values.password,
      role: "user",
    };

    const res = await api.post("/auth/register", payload);

    if (res.data.success) {
      alert("Đăng ký thành công!");
      nav("/auth/login");
    } else {
      alert("Đăng ký thất bại: " + res.data.message);
    }
  } catch (error) {
    console.error("Register Error:", error);
    alert("Lỗi khi đăng ký!");
  }
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl my-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Đăng ký tài khoản
          </h1>
          <p className="text-gray-500 mt-1">Tạo tài khoản để sử dụng dịch vụ</p>
        </div>

        {/* FORM */}
        <Form
          name="register"
          layout="vertical"
          requiredMark={false}
          scrollToFirstError
          onFinish={handleRegister}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nguyễn Văn A"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Ngày sinh"
              name="dateOfBirth"
              rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
            >
              <DatePicker size="large" className="w-full" format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item
              label="Giới tính"
              name="gender"
              rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
            >
              <Radio.Group>
                <Radio value="male">Nam</Radio>
                <Radio value="female">Nữ</Radio>
                <Radio value="other">Khác</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label="CCCD / CMND"
              name="identityCard"
              rules={[
                { required: true, message: "Vui lòng nhập CCCD!" },
                { pattern: /^[0-9]{9,12}$/, message: "CCCD không hợp lệ!" },
              ]}
            >
              <Input
                prefix={<IdcardOutlined />}
                placeholder="0123456789"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="email@example.com"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                { pattern: /^[0-9]{10}$/, message: "SĐT không hợp lệ!" },
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="0123456789"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Địa chỉ"
              name="address"
              className="md:col-span-2"
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
            >
              <Input
                placeholder="Số nhà, đường, quận, thành phố"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu!" },
                { min: 6, message: "Mật khẩu ít nhất 6 ký tự!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                size="large"
                placeholder="******"
              />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Vui lòng nhập lại mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    return !value || getFieldValue("password") === value
                      ? Promise.resolve()
                      : Promise.reject(new Error("Mật khẩu không khớp!"));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                size="large"
                placeholder="******"
              />
            </Form.Item>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              Đăng ký
            </Button>
          </Form.Item>

          <Button block size="large" style={{ marginBottom: 12 }}>
            <Link to="/" style={{ display: "block" }}>
              Quay về trang chủ
            </Link>
          </Button>
        </Form>

        {/* Link login */}
        <div className="text-center">
          <span className="text-gray-600">Đã có tài khoản? </span>
          <Link to="/auth/login" className="text-blue-600 font-semibold">
            Đăng nhập ngay
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
