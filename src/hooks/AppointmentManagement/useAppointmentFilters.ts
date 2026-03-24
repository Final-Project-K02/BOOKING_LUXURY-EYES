import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import type { AppointmentStatus } from "../../types/Booking";
import {
  FILTERABLE_STATUSES,
  PAYMENT_STATUS_MAP,
} from "../../constants/AppointmentManagement/appointmentAdminConstants";
import { toArrayQueryValue } from "../../utils/AppointmentManagement/appointmentAdminHelpers";

export const useAppointmentFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [statusFilters, setStatusFilters] = useState<AppointmentStatus[]>([]);
  const [paymentStatusFilters, setPaymentStatusFilters] = useState<string[]>(
    [],
  );
  const [doctorFilter, setDoctorFilter] = useState<string | undefined>(
    undefined,
  );
  const [patientKeyword, setPatientKeyword] = useState("");

  const buildFilterParams = (filters?: {
    dateRange: [Dayjs | null, Dayjs | null] | null;
    statusFilters: AppointmentStatus[];
    paymentStatusFilters: string[];
    doctorFilter?: string;
    patientKeyword: string;
  }): Record<string, string> => {
    const source = filters ?? {
      dateRange,
      statusFilters,
      paymentStatusFilters,
      doctorFilter,
      patientKeyword,
    };
    const params: Record<string, string> = {};

    if (source.dateRange?.[0])
      params.dateFrom = source.dateRange[0].format("YYYY-MM-DD");
    if (source.dateRange?.[1])
      params.dateTo = source.dateRange[1].format("YYYY-MM-DD");
    if (source.statusFilters.length > 0)
      params.status = source.statusFilters.join(",");
    if (source.paymentStatusFilters.length > 0)
      params.paymentStatus = source.paymentStatusFilters.join(",");
    if (source.doctorFilter) params.doctorId = source.doctorFilter;
    if (source.patientKeyword.trim())
      params.patientKeyword = source.patientKeyword.trim();

    return params;
  };

  const getFiltersFromSearchParams = () => {
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const dateFromDayjs = dateFrom ? dayjs(dateFrom) : null;
    const dateToDayjs = dateTo ? dayjs(dateTo) : null;
    const resolvedDateRange =
      dateFromDayjs?.isValid() || dateToDayjs?.isValid()
        ? ([
            dateFromDayjs?.isValid() ? dateFromDayjs : null,
            dateToDayjs?.isValid() ? dateToDayjs : null,
          ] as [Dayjs | null, Dayjs | null])
        : null;

    const statusSet = new Set<string>(FILTERABLE_STATUSES);
    const paymentStatusSet = new Set(Object.keys(PAYMENT_STATUS_MAP));

    const resolvedStatusFilters = toArrayQueryValue(searchParams.get("status"))
      .filter((v) => statusSet.has(v))
      .map((v) => v as AppointmentStatus);

    const resolvedPaymentStatusFilters = toArrayQueryValue(
      searchParams.get("paymentStatus"),
    ).filter((v) => paymentStatusSet.has(v));

    return {
      dateRange: resolvedDateRange,
      statusFilters: resolvedStatusFilters,
      paymentStatusFilters: resolvedPaymentStatusFilters,
      doctorFilter: searchParams.get("doctorId") || undefined,
      patientKeyword: searchParams.get("patientKeyword") || "",
    };
  };

  const applyFiltersToState = (
    filters: ReturnType<typeof getFiltersFromSearchParams>,
  ) => {
    setDateRange(filters.dateRange);
    setStatusFilters(filters.statusFilters);
    setPaymentStatusFilters(filters.paymentStatusFilters);
    setDoctorFilter(filters.doctorFilter);
    setPatientKeyword(filters.patientKeyword);
  };

  const handleApplyFilters = () => {
    setSearchParams(buildFilterParams());
  };

  const handleResetFilters = () => {
    setDateRange(null);
    setStatusFilters([]);
    setPaymentStatusFilters([]);
    setDoctorFilter(undefined);
    setPatientKeyword("");
    setSearchParams({});
  };

  return {
    searchParams,
    dateRange,
    setDateRange,
    statusFilters,
    setStatusFilters,
    paymentStatusFilters,
    setPaymentStatusFilters,
    doctorFilter,
    setDoctorFilter,
    patientKeyword,
    setPatientKeyword,
    buildFilterParams,
    getFiltersFromSearchParams,
    applyFiltersToState,
    handleApplyFilters,
    handleResetFilters,
  };
};
