import type { UploadProps } from "antd";
import { Form, message, Upload } from "antd";
import { useEffect, useState } from "react";
import api from "../../api";
import { AVATAR_MAX_SIZE_BYTES, AVATAR_UPLOAD_FOLDER } from "../../constants/DoctorManagement/doctorConstants";
import type { Doctor, DoctorFilter, DoctorFormValues } from "../../types/Doctor";
import { getPriceByExperience } from "../../utils/DoctorManagement/doctorUtils";

const useDoctorManagement = () => {
  // ===== STATE =====
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [filters, setFilters] = useState<DoctorFilter>({});

  const [form] = Form.useForm<DoctorFormValues>();

  // ===== FETCH =====
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: Doctor[] }>("/doctors/admin", {
        params: filters,
      });
      setDoctors(res.data.data ?? []);
    } catch {
      message.error("Không thể tải danh sách bác sĩ");
    } finally {
      setLoading(false);
    }
  };

  // ===== EFFECTS =====
  useEffect(() => {
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // ===== ACTIONS =====
  const handleOpenAdd = () => {
    setEditingDoctor(null);
    form.resetFields();
    form.setFieldsValue({ price: getPriceByExperience(0) });
    setOpenModal(true);
  };

  const handleOpenEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    form.setFieldsValue({
      ...doctor,
      price: getPriceByExperience(doctor.experience_year),
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingDoctor(null);
    form.resetFields();
  };

  const handleSubmit = async (values: DoctorFormValues) => {
    const payload: DoctorFormValues = {
      ...values,
      name: values.name?.trim(),
      avatar: values.avatar?.trim() || undefined,
      email: values.email?.trim() || undefined,
      phone: values.phone?.trim() || undefined,
      description: values.description?.trim() || undefined,
    };

    try {
      if (editingDoctor) {
        await api.put(`/doctors/${editingDoctor._id}`, payload);
        message.success("Cập nhật bác sĩ thành công");
      } else {
        await api.post("/doctors", payload);
        message.success("Thêm bác sĩ thành công");
      }
      handleCloseModal();
      fetchDoctors();
    } catch {
      message.error("Thao tác thất bại");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/doctors/${id}`);
      message.success("Xoá bác sĩ thành công");
      fetchDoctors();
    } catch {
      message.error("Xoá thất bại");
    }
  };

  const handleToggleStatus = async (doctor: Doctor) => {
    try {
      await api.patch(`/doctors/${doctor._id}/status`);
      message.success(
        doctor.is_active ? "Tắt bác sĩ thành công" : "Bật bác sĩ thành công",
      );
      fetchDoctors();
    } catch {
      message.error("Bác sĩ có lịch khám sắp tới , không thể tắt");
    }
  };

  const handleFilterChange = (changed: Partial<DoctorFilter>) => {
    setFilters((prev) => ({ ...prev, ...changed }));
  };

  const handleFilterReset = () => {
    setFilters({});
  };

  // ===== AVATAR UPLOAD =====
  const uploadDoctorAvatar = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", AVATAR_UPLOAD_FOLDER);
    const res = await api.post("/uploads/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data?.data?.url as string;
  };

  const uploadProps: UploadProps = {
    accept: "image/*",
    showUploadList: false,
    beforeUpload: async (file) => {
      try {
        setUploadingAvatar(true);
        if ((file as File).size > AVATAR_MAX_SIZE_BYTES) {
          message.error("Ảnh quá lớn (tối đa 5MB)");
          return Upload.LIST_IGNORE;
        }
        const url = await uploadDoctorAvatar(file as File);
        if (!url) {
          message.error("Upload thất bại: không nhận được url");
          return Upload.LIST_IGNORE;
        }
        form.setFieldValue("avatar", url);
        message.success("Upload avatar thành công");
      } catch (err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        message.error(axiosErr?.response?.data?.message || "Upload thất bại");
      } finally {
        setUploadingAvatar(false);
      }
      return false;
    },
  };

  return {
    // state
    doctors,
    loading,
    openModal,
    editingDoctor,
    uploadingAvatar,
    filters,
    form,
    uploadProps,
    // actions
    handleOpenAdd,
    handleOpenEdit,
    handleCloseModal,
    handleSubmit,
    handleDelete,
    handleToggleStatus,
    handleFilterChange,
    handleFilterReset,
    fetchDoctors,
    getPriceByExperience,
  };
};

export default useDoctorManagement;
