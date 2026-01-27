import {
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { DatePicker, Form, Input, Modal, Radio } from "antd";
import React from "react";

export interface PatientInput {
  name: string;
  dateOfBirth: string;
  gender: string;
  identityCard: string;
  email: string;
  phone: string;
  address: string;
}

interface AddPatientModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (data: PatientInput) => void;
  confirmLoading?: boolean;
}

const AddPatientModal: React.FC<AddPatientModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  confirmLoading,
}) => {
  const [form] = Form.useForm();
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  return (
    <Modal
      title="Thêm mới người bệnh"
      open={visible}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      onOk={handleOk} // <-- chạy validate
      okText="Thêm người bệnh"
      cancelText="Hủy"
      width={800}
    >
      <Form form={form} layout="vertical">
        {" "}
        {/* <-- gắn form */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Họ và tên */}
          <Form.Item
            name="fullName"
            label="Họ và tên"
            normalize={(value) => value?.trim()}
            rules={[
              { required: true, message: "Vui lòng nhập họ và tên" },
              { min: 3, message: "Tối thiểu phải có 3 ký tự" },
            ]}
          >
            <Input
              size="large"
              placeholder="Nguyễn Văn A (bắt buộc)"
              prefix={<UserOutlined />}
            />
          </Form.Item>

          {/* Ngày sinh */}
          <Form.Item
            name="dateOfBirth"
            label="Ngày sinh"
            rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
          >
            <DatePicker size="large" className="w-full" format="DD/MM/YYYY" />
          </Form.Item>

          {/* Giới tính */}
          <Form.Item
            name="gender"
            label="Giới tính"
            rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
          >
            <Radio.Group size="large">
              <Radio value="male">Nam</Radio>
              <Radio value="female">Nữ</Radio>
              <Radio value="other">Khác</Radio>
            </Radio.Group>
          </Form.Item>

          {/* CCCD */}
          <Form.Item
            name="identityCard"
            label="CCCD/CMND"
            getValueFromEvent={(e) => e.target.value.replace(/\D/g, "")}
            rules={[
              { required: true, message: "Vui lòng nhập số căn cước công dân" },
              {
                pattern: /^(\d{9}|\d{12})$/,
                message: "CMND/CCCD phải gồm 9 hoặc 12 chữ số",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="Nhập số căn cước công dân"
              prefix={<IdcardOutlined />}
              maxLength={12}
              inputMode="numeric"
            />
          </Form.Item>

          {/* Email */}
          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: "email", message: "Email không hợp lệ" }]}
          >
            <Input
              size="large"
              placeholder="ví dụ: nguyenvana@gmail.com"
              prefix={<MailOutlined />}
            />
          </Form.Item>

          {/* Số điện thoại */}
          <Form.Item
            name="phone"
            label="Số điện thoại"
            getValueFromEvent={(e) => e.target.value.replace(/\D/g, "")}
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
              {
                pattern: /^0\d{9}$/,
                message: "Số điện thoại phải bắt đầu bằng 0 và đủ 10 số",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="Nhập số điện thoại"
              prefix={<PhoneOutlined />}
            />
          </Form.Item>

          {/* Địa chỉ */}
          <Form.Item name="address" label="Địa chỉ" className="md:col-span-2">
            <Input size="large" placeholder="Nhập địa chỉ cụ thể" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default AddPatientModal;
