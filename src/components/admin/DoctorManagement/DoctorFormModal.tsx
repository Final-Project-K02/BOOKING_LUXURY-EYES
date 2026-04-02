import { Button, Form, Image, Input, InputNumber, Modal, Upload } from "antd";
import type { UploadProps } from "antd";
import type { FormInstance } from "antd/es/form";
import type { Doctor, DoctorFormValues } from "../../../types/Doctor";
import { getPriceByExperience } from "../../../utils/DoctorManagement/doctorUtils";

interface Props {
  open: boolean;
  editingDoctor: Doctor | null;
  form: FormInstance<DoctorFormValues>;
  uploadingAvatar: boolean;
  uploadProps: UploadProps;
  onCancel: () => void;
  onFinish: (values: DoctorFormValues) => void;
}

const DoctorFormModal: React.FC<Props> = ({
  open,
  editingDoctor,
  form,
  uploadingAvatar,
  uploadProps,
  onCancel,
  onFinish,
}) => {
  return (
    <Modal
      destroyOnHidden
      open={open}
      title={editingDoctor ? "Cập nhật bác sĩ" : "Thêm bác sĩ"}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Lưu"
      okButtonProps={{ disabled: uploadingAvatar }}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        initialValues={{ price: getPriceByExperience(0) }}
      >
        <Form.Item
          label="Tên bác sĩ"
          name="name"
          rules={[
            {
              required: true,
              whitespace: true,
              message: "Tên bác sĩ là bắt buộc",
            },
          ]}
        >
          <Input />
        </Form.Item>

        {/* Avatar: URL input + upload + preview */}
        <Form.Item
          label="Avatar"
          name="avatar"
          rules={[
            {
              validator: async (_, value: string | undefined) => {
                if (!value || !value.trim()) return Promise.resolve();
                // Reject if it looks like a local file path
                if (value.includes("fakepath") || /^[A-Z]:\\/.test(value)) {
                  return Promise.reject(
                    new Error(
                      "Vui lòng upload ảnh thay vì chọn file cục bộ",
                    ),
                  );
                }
                try {
                  new URL(value.trim());
                  return Promise.resolve();
                } catch {
                  return Promise.reject(new Error("Avatar phải là URL hợp lệ"));
                }
              },
            },
          ]}
        >
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
              {form.getFieldValue("avatar")?.includes("fakepath") ? (
                <div
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 8,
                    background: "#f5f5f5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#f00",
                    fontSize: 10,
                    textAlign: "center",
                    padding: 4,
                  }}
                >
                  Invalid File
                </div>
              ) : form.getFieldValue("avatar") ? (
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

        <Form.Item
          label="Số năm kinh nghiệm"
          name="experience_year"
          rules={[
            { required: true, message: "Số năm kinh nghiệm là bắt buộc" },
            { type: "number", min: 0, message: "Số năm kinh nghiệm phải >= 0" },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            onChange={(val) => {
              const year = Number(val ?? 0);
              if (!Number.isNaN(year)) {
                // Sử dụng setTimeout 0 để đẩy việc cập nhật ra khỏi vòng lặp render/event hiện tại
                setTimeout(() => {
                  form.setFieldsValue({
                    price: getPriceByExperience(year),
                  });
                }, 0);
              }
            }}
          />
        </Form.Item>

        <Form.Item
          label="Giá khám"
          name="price"
          rules={[
            { required: true, message: "Giá khám là bắt buộc" },
            { type: "number", min: 0, message: "Giá khám phải >= 0" },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            disabled
            formatter={(value) =>
              value ? `${Number(value).toLocaleString("vi-VN")} đ` : ""
            }
            parser={(value) => Number(value?.replace(/\D/g, "") ?? 0) as 0}
          />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: !editingDoctor, message: "Email là bắt buộc" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[
            { required: !editingDoctor, message: "Số điện thoại là bắt buộc" },
            {
              pattern: /^0\d{9}$/,
              message: "Số điện thoại không hợp lệ",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DoctorFormModal;
