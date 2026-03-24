import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { message } from "antd";
import { useMemo, useState } from "react";
import {
  useCreatePatientProfileMutation,
  useDeletePatientProfileMutation,
  useGetPatientProfileQuery,
  useUpdatePatientProfileMutation,
} from "../../app/services/patientProfile";
import type {
  CreatePatientInput,
  PatientResponse,
} from "../../types/PatientProfile";

/**
 * Quản lý hồ sơ bệnh nhân: chọn, thêm, sửa, xóa.
 */
export const usePatientProfile = () => {
  const [selectedPerson, setSelectedPerson] = useState<string>("");
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientResponse | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState(false);

  const { data: patientProfileResponse } = useGetPatientProfileQuery();
  const patientList: PatientResponse[] = useMemo(
    () => patientProfileResponse?.data ?? [],
    [patientProfileResponse?.data],
  );

  const [createPatientProfile, { isLoading: isCreatingPatient }] =
    useCreatePatientProfileMutation();
  const [updatePatientProfile, { isLoading: isUpdatingPatient }] =
    useUpdatePatientProfileMutation();
  const [deletePatientProfile] = useDeletePatientProfileMutation();

  const handlePatientChange = (value: string) => {
    if (value === "add-new") {
      setIsEditing(false);
      setEditingPatient(null);
      setShowAddPatientModal(true);
    } else {
      setSelectedPerson(value);
    }
  };

  const handleAddPatient = async (values: CreatePatientInput) => {
    try {
      if (isEditing && editingPatient) {
        await updatePatientProfile({
          id: editingPatient._id,
          body: values,
        }).unwrap();
        message.success("Cập nhật thông tin thành công");
      } else {
        const res = await createPatientProfile(values).unwrap();
        setSelectedPerson(res.data._id);
        message.success("Thêm hồ sơ thành công");
      }
      setShowAddPatientModal(false);
      setEditingPatient(null);
    } catch (err) {
      console.error("Error:", err);
      const error = err as FetchBaseQueryError;
      const apiError = error.data as
        | { message?: string; error?: string[] }
        | undefined;
      if (Array.isArray(apiError?.error)) {
        message.error(apiError.error.join(" | "));
        return;
      }
      if (typeof apiError?.message === "string") {
        message.error(apiError.message);
        return;
      }
      message.error(isEditing ? "Cập nhật thất bại" : "Thêm hồ sơ thất bại");
    }
  };

  const handleDeletePatient = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa hồ sơ này không?")) return;
    try {
      await deletePatientProfile(id).unwrap();
      if (selectedPerson === id) setSelectedPerson("");
      message.success("Xóa hồ sơ thành công");
    } catch (error) {
      console.log(error);
      message.error("Xóa hồ sơ thất bại");
    }
  };

  const openEditModal = (patient: PatientResponse) => {
    setEditingPatient(patient);
    setIsEditing(true);
    setShowAddPatientModal(true);
  };

  const closeModal = () => {
    setShowAddPatientModal(false);
    setEditingPatient(null);
    setIsEditing(false);
  };

  return {
    selectedPerson,
    patientList,
    showAddPatientModal,
    editingPatient,
    isEditing,
    isCreatingPatient,
    isUpdatingPatient,
    handlePatientChange,
    handleAddPatient,
    handleDeletePatient,
    openEditModal,
    closeModal,
  };
};
