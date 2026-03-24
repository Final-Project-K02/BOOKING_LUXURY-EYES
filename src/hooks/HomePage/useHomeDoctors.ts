import { useMemo } from "react";
import { useGetDoctorsQuery } from "../../app/services/doctorApi";
import type { Doctor } from "../../types/Doctor";

export const useHomeDoctors = () => {
  const { data } = useGetDoctorsQuery();
  const doctors = useMemo<Doctor[]>(() => data?.data ?? [], [data]);

  const experiencedDoctors = useMemo(() => {
    return doctors
      .map((doc) => ({
        ...doc,
        experience_year: Number((doc as Doctor).experience_year),
      }))
      .filter((doc) => Number((doc as Doctor).experience_year) >= 10);
  }, [doctors]);

  return {
    doctors,
    experiencedDoctors,
  };
};
