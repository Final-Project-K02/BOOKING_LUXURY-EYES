import type { UploadProps } from "antd";
import { Form, message, Upload } from "antd";
import { useState } from "react";
import {
  useCreateDoctorMutation,
  useDeleteDoctorMutation,
  useGetDoctorsByAdminQuery,
  useToggleDoctorStatusMutation,
  useUpdateDoctorMutation,
} from "../../app/services/doctorApi";
import { useUploadImageMutation } from "../../app/services/uploadApi";
import {
  AVATAR_MAX_SIZE_BYTES,
  AVATAR_UPLOAD_FOLDER,
} from "../../constants/admin/doctorConstants";
import type {
  Doctor,
  DoctorFilter,
  DoctorFormValues,
} from "../../types/Doctor";
import { getPriceByExperience } from "../../utils/DoctorManagement/doctorUtils";

const useDoctorManagement = () => {
  // ===== STATE =====
  const [openModal, setOpenModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [filters, setFilters] = useState<DoctorFilter>({});

  const [form] = Form.useForm<DoctorFormValues>();

  // ===== RTK QUERY =====
  const {
    data,
    isFetching: loading,
    refetch,
  } = useGetDoctorsByAdminQuery(filters, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const doctors = data?.data ?? [];

  const [createDoctor] = useCreateDoctorMutation();
  const [updateDoctor] = useUpdateDoctorMutation();
  const [deleteDoctor] = useDeleteDoctorMutation();
  const [toggleDoctorStatus] = useToggleDoctorStatusMutation();
  const [uploadImage] = useUploadImageMutation();

  // ===== FETCH =====
  const fetchDoctors = () => refetch();

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
        await updateDoctor({ id: editingDoctor._id, ...payload }).unwrap();
        message.success("Cập nhật bác sĩ thành công");
      } else {
        await createDoctor(payload).unwrap();
        message.success("Thêm bác sĩ thành công");
      }
      handleCloseModal();
    } catch {
      message.error("Thao tác thất bại");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoctor(id).unwrap();
      message.success("Xoá bác sĩ thành công");
    } catch {
      message.error("Xoá thất bại");
    }
  };

  const handleToggleStatus = async (doctor: Doctor) => {
    try {
      await toggleDoctorStatus(doctor._id).unwrap();
      message.success(
        doctor.is_active ? "Tắt bác sĩ thành công" : "Bật bác sĩ thành công",
      );
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
        const result = await uploadImage({
          file: file as File,
          folder: AVATAR_UPLOAD_FOLDER,
        }).unwrap();
        const url = result?.data?.url;
        if (!url) {
          message.error("Upload thất bại: không nhận được url");
          return Upload.LIST_IGNORE;
        }
        form.setFieldValue("avatar", url);
        message.success("Upload avatar thành công");
      } catch (err) {
        const apiErr = err as { data?: { message?: string } };
        message.error(apiErr?.data?.message || "Upload thất bại");
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
