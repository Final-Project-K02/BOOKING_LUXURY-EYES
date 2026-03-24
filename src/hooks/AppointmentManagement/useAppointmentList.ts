import { useState } from "react";
import { message } from "antd";
import api from "../../api";
import type { Appointment } from "../../types/Booking";
import type { Doctor } from "../../types/Doctor";

export const useAppointmentList = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchAppointments = async (params?: Record<string, string>) => {
    try {
      setLoading(true);
      const res = await api.get<{ data: Appointment[] }>("/appointments", {
        params,
      });
      setAppointments(res.data.data ?? []);
    } catch {
      message.error("Không thể tải lịch hẹn");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await api.get<{ data: Doctor[] }>("/doctors/admin");
      setDoctors(res.data.data ?? []);
    } catch {
      message.error("Không thể tải danh sách bác sĩ");
    }
  };

  const fetchAppointmentDetail = async (
    id: string,
    onLoadingChange: (loading: boolean) => void,
  ): Promise<Appointment | null> => {
    try {
      onLoadingChange(true);
      const res = await api.get<{ data: Appointment }>(`/appointments/${id}`);
      return res.data.data;
    } catch {
      message.error("Không thể tải chi tiết lịch hẹn");
      return null;
    } finally {
      onLoadingChange(false);
    }
  };

  return {
    appointments,
    doctors,
    loading,
    detailLoading,
    setDetailLoading,
    fetchAppointments,
    fetchDoctors,
    fetchAppointmentDetail,
  };
};
