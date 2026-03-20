import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useGetDoctorsQuery } from "../app/services/doctorApi";

/**
 * Quản lý search/filter bác sĩ: input, debounce, date range, pagination.
 */
export const useDoctorSearch = () => {
  const [inputSearch, setInputSearch] = useState<string>("");
  const [delaySearch, setDelaySearch] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  const { data, isLoading, isFetching, isError } = useGetDoctorsQuery({
    inputSearch: delaySearch,
    scheduleDateFrom: fromDate || undefined,
    scheduleDateTo: toDate || undefined,
    page: currentPage,
    limit: pageSize,
  });

  // Debounce search input
  useEffect(() => {
    const timeout = setTimeout(() => setDelaySearch(inputSearch), 300);
    return () => clearTimeout(timeout);
  }, [inputSearch]);

  // Reset page khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [delaySearch, fromDate, toDate]);

  const handleReset = () => {
    setInputSearch("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  const handleRangeChange = (dates: (Dayjs | null)[] | null) => {
    if (dates && dates[0] && dates[1]) {
      setFromDate(dates[0].format("YYYY-MM-DD"));
      setToDate(dates[1].format("YYYY-MM-DD"));
      setCurrentPage(1);
    } else {
      setFromDate("");
      setToDate("");
      setCurrentPage(1);
    }
  };

  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf("day");
  };

  return {
    inputSearch,
    setInputSearch,
    fromDate,
    toDate,
    currentPage,
    setCurrentPage,
    pageSize,
    data,
    isLoading,
    isFetching,
    isError,
    handleReset,
    handleRangeChange,
    disabledDate,
  };
};
