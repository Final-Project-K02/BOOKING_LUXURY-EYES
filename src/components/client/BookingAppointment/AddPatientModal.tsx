import {
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { DatePicker, Form, Input, Modal, Radio } from "antd";
import React, { useEffect } from "react";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import type { CreatePatientInput } from "../../../types/PatientProfile";

dayjs.extend(isSameOrBefore);

export interface PatientInput {
  fullName: string;
  dateOfBirth?: dayjs.Dayjs | string | null;
  gender: string;
  identityCard: string;
  email: string;
  phone: string;
  address: string;
}

interface AddPatientModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (data: CreatePatientInput) => Promise<void>;
  confirmLoading?: boolean;
  editingPatient?: (PatientInput & { _id: string }) | null;
  isEditing?: boolean;
}

const AddPatientModal: React.FC<AddPatientModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  confirmLoading,
  editingPatient,
  isEditing = false,
}) => {
  // Form instance - warning in Strict Mode is expected but harmless
  // Form is properly connected via form={form} prop below
  const [form] = Form.useForm();

  // Populate form when editing
  useEffect(() => {
    if (!visible) return;

    if (isEditing && editingPatient) {
      form.setFieldsValue({
        fullName: editingPatient.fullName,
        dateOfBirth: editingPatient.dateOfBirth
          ? dayjs(editingPatient.dateOfBirth)
          : null,
        gender: editingPatient.gender,
        identityCard: editingPatient.identityCard,
        email: editingPatient.email,
        phone: editingPatient.phone,
        address: editingPatient.address,
      });
    } else {
      form.resetFields();
    }
  }, [visible, editingPatient, isEditing, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      onSubmit({
        ...values,
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.format("YYYY-MM-DD")
          : undefined,
      });

      form.resetFields();
    } catch (err) {
      console.log("Validation failed:", err);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const disableFutureDate = (current: dayjs.Dayjs) => {
    return current && current > dayjs().endOf("day");
  };

  return (
    <Modal
      destroyOnHidden
      title={
        isEditing ? "Chỉnh sửa thông tin người bệnh" : "Thêm mới người bệnh"
      }
      open={visible}
      onCancel={handleCancel}
      confirmLoading={confirmLoading}
      onOk={handleOk}
      okText={isEditing ? "Cập nhật" : "Thêm người bệnh"}
      cancelText="Hủy"
      width={800}
    >
      <Form form={form} layout="vertical">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Họ và tên */}
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[
              { required: true, message: "Vui lòng nhập họ và tên" },
              {
                validator(_, value) {
                  if (!value) {
                    return Promise.resolve();
                  }
                  const trimmed = value.trim();
                  if (trimmed.length < 3) {
                    return Promise.reject(
                      new Error("Tối thiểu phải có 3 ký tự"),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              size="large"
              placeholder="Nguyễn Văn A (bắt buộc)"
              prefix={<UserOutlined />}
              onBlur={(e) => {
                e.target.value = e.target.value.trim();
              }}
            />
          </Form.Item>

          {/* Ngày sinh */}
          <Form.Item
            name="dateOfBirth"
            label="Ngày sinh"
            rules={[
              { required: true, message: "Vui lòng chọn ngày sinh" },
              {
                validator: (_, value) => {
                  if (!value || dayjs(value).isSameOrBefore(dayjs(), "day")) {
                    return Promise.resolve();
                  }

                  return Promise.reject(
                    new Error("Ngày sinh không được lớn hơn ngày hiện tại"),
                  );
                },
              },
            ]}
          >
            <DatePicker
              size="large"
              className="w-full"
              format="DD/MM/YYYY"
              disabledDate={disableFutureDate}
            />
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
              // { required: true, message: "Vui lòng nhập số căn cước công dân" },
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
