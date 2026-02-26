import {
  CalendarOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { skipToken, type FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Avatar, Button, Card, DatePicker, Input, message, Select } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../app/hook";
import {
  useCreateBookingMutation,
  useGetAppointmentsQuery,
  useGetBookingByScheduleIdQuery,
} from "../../app/services/appointmentApi";
import { useGetDoctorsQuery } from "../../app/services/doctorApi";
import {
  useCreatePatientProfileMutation,
  useDeletePatientProfileMutation,
  useGetPatientProfileQuery,
  useUpdatePatientProfileMutation,
} from "../../app/services/patientProfile";
import { useGetScheduleDoctorIdQuery } from "../../app/services/scheduleApi";
import AddPatientModal from "../../components/BookingAppointment/AddPatientModal";
import DoctorList from "../../components/BookingAppointment/DoctorList";
import TimeSlotPicker from "../../components/BookingAppointment/TimeSlotPicker";
import { BLOCK_STATUSES, type BookingPayload } from "../../types/Booking";
import type { Doctor } from "../../types/Doctor";
import type {
  CreatePatientInput,
  PatientResponse,
} from "../../types/PatientProfile";
import type {
  DoctorSchedule,
  SelectedSchedule,
  TimeSlot,
  TimeSlotUI,
} from "../../types/Schedule";
import type { AppointmentStatus } from "./AppointmentHistoryPage";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;
const { TextArea } = Input;

const BookingAppointmentPage = () => {
  // Search doctor
  const [inputSearch, setInputSearch] = useState<string>("");
  const [delaySearch, setDelaySearch] = useState<string>("");

  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Doctors
  const { data, isLoading, isFetching, isError } = useGetDoctorsQuery({
    inputSearch: delaySearch,
    scheduleDateFrom: fromDate || undefined,
    scheduleDateTo: toDate || undefined,
  });
  const doctors: Doctor[] = useMemo(() => data?.data ?? [], [data]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Schedule
  const { data: schedule } = useGetScheduleDoctorIdQuery(
    selectedDoctor?._id as string,
    {
      skip: !selectedDoctor?._id,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );
  const scheduleDoctorId: DoctorSchedule[] = schedule?.data ?? [];
  const scheduleItem = scheduleDoctorId[0];

  const [selectedPerson, setSelectedPerson] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedSchedule, setSelectedSchedule] =
    useState<SelectedSchedule | null>(null);

  // Authentication
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Appointments
  const { data: getBookingUserId } = useGetAppointmentsQuery(
    user?._id ?? skipToken,
    {
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );

  const getBookingUserData = useMemo(
    () => getBookingUserId?.data ?? [],
    [getBookingUserId],
  );

  const { data: getBookingBySlotId } = useGetBookingByScheduleIdQuery(
    scheduleItem?._id,
    {
      skip: !scheduleItem?._id,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );

  const getBookingBySchedIdData = useMemo(
    () => getBookingBySlotId?.data ?? [],
    [getBookingBySlotId],
  );

  const [symptoms, setSymptoms] = useState<string>("");

  // Patient profile
  const { data: patientProfileResponse } = useGetPatientProfileQuery();
  const PatientProData: PatientResponse[] = patientProfileResponse?.data ?? [];

  const [createPatientProfile, { isLoading: isCreatingPatient }] =
    useCreatePatientProfileMutation();

  const [updatePatientProfile, { isLoading: isUpdatingPatient }] =
    useUpdatePatientProfileMutation();
  const [deletePatientProfile] = useDeletePatientProfileMutation();

  const [createBooking] = useCreateBookingMutation();

  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientResponse | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState(false);

  const nav = useNavigate();

  // Select doctor
  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedSchedule(null);
  };

  const handleTimeSelect = (slot: TimeSlot) => {
    if (selectedDoctor && scheduleItem) {
      const formattedDate = dayjs(slot.date).format("DD/MM");

      setSelectedSlot(slot);

      setSelectedSchedule({
        scheduleSlotId: slot.scheduleSlotId,
        date: slot.date,
        time: slot.time,
        location: "Vân Canh - Hoài Đức",
        room: scheduleItem.roomName,
        displayDate: `${slot.time} - ${formattedDate}`,
      });
    }
  };

  const handleBackToList = () => {
    setSelectedDoctor(null);
    setSelectedSchedule(null);
  };

  // Open add patient modal
  const handlePatientChange = (value: string) => {
    if (value === "add-new") {
      setIsEditing(false);
      setEditingPatient(null);
      setShowAddPatientModal(true);
    } else {
      setSelectedPerson(value);
    }
  };

  // Add or update patient
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

      if (selectedPerson === id) {
        setSelectedPerson("");
      }

      message.success("Xóa hồ sơ thành công");
    } catch (error) {
      console.log(error);
      message.error("Xóa hồ sơ thất bại");
    }
  };

  // Delay search
  useEffect(() => {
    const timeout = setTimeout(() => setDelaySearch(inputSearch), 300);
    return () => clearTimeout(timeout);
  }, [inputSearch]);

  // Reset filters
  const handleReset = () => {
    setInputSearch("");
    setFromDate("");
    setToDate("");
    setSelectedDoctor(null);
    setSelectedSchedule(null);
  };

  // Handle date range change
  const handleRangeChange = (dates: (Dayjs | null)[] | null) => {
    if (dates && dates[0] && dates[1]) {
      setFromDate(dates[0].format("YYYY-MM-DD"));
      setToDate(dates[1].format("YYYY-MM-DD"));

      setSelectedDoctor(null);
      setSelectedSchedule(null);
    } else {
      setFromDate("");
      setToDate("");
    }
  };

  // Disable past dates
  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf("day");
  };

  //   // Check for booking conflicts
  //   const slotsWithState = useMemo<TimeSlotUI[]>(() => {
  //     if (!scheduleItem?.timeSlots || !getBookingBySchedIdData) {
  //       return [];
  //     }

  //     const today = dayjs().startOf("day");

  //     return scheduleItem.timeSlots
  //       .filter((slot) => {
  //         const slotDay = dayjs(slot.date).startOf("day");
  //         return slotDay.isAfter(today);
  //       })
  //       .map((slot) => {
  //         const slotDate = dayjs(slot.date).format("YYYY-MM-DD");

  //         const doctorBlocked = getBookingBySchedIdData.some((apm) => {
  //           return (
  //             dayjs(apm.dateTime).format("YYYY-MM-DD") === slotDate &&
  //             apm.time === slot.time &&
  //             BLOCK_STATUSES.includes(apm.status)
  //           );
  //         });

  //  const patientBlocked = getBookingUserData.some((apm) => {
  //   const apmPatientId =
  //     typeof apm.patient === "string" ? apm.patient : apm.patient?._id;

  //   return (
  //     apmPatientId === selectedPerson &&
  //     dayjs(apm.dateTime).format("YYYY-MM-DD") === slotDate &&
  //     apm.time === slot.time &&
  //     BLOCK_STATUSES.includes(apm.status)
  //   );
  // });

  //         const disabled =
  //           slot.status !== "AVAILABLE" || doctorBlocked || patientBlocked;

  //         return {
  //           ...slot,
  //           disabled,
  //           disabledReason: doctorBlocked
  //             ? "Khung giờ đã được đặt"
  //             : patientBlocked
  //               ? "Bạn đã có lịch cùng khung giờ"
  //               : slot.status !== "AVAILABLE"
  //                 ? "Khung giờ không khả dụng"
  //                 : undefined,
  //         };
  //       });
  //   }, [scheduleItem?.timeSlots, getBookingUserData, getBookingBySchedIdData]);

  // Confirm booking
  const handleConfirmBooking = async () => {
    if (!user?._id || !isAuthenticated) {
      message.error("Vui lòng đăng nhập");
      nav("/auth/login");
      return;
    }
    if (!selectedPerson) {
      message.error("Vui lòng chọn người tới khám");
      return false;
    }

    if (!selectedDoctor) {
      message.error("Vui lòng chọn bác sĩ");
      return false;
    }

    if (!selectedSchedule) {
      message.error("Vui lòng chọn lịch khám");
      return false;
    }

    try {
      const payload = {
        userId: user?._id ?? "", // Chưa được gửi trong API hiện tại
        scheduleId: scheduleItem._id,
        scheduleSlotId: Number(selectedSchedule.scheduleSlotId) || 0, // Chưa được gửi trong API hiện tại
        dateTime: selectedSchedule?.date ?? "",
        time: selectedSchedule?.time ?? "",
        blockTime: 30, // Chưa được gửi trong API hiện tại
        location: selectedSchedule?.location ?? "", // Chưa được gửi trong API hiện tại
        status: "PENDING" as AppointmentStatus, // Chưa được gửi trong API hiện tại
        appointmentMethod: "DIRECT", // Chưa được gửi trong API hiện tại
        symptoms: symptoms, // Chưa được gửi trong API hiện tại
        payment: {
          // Chưa được gửi trong API hiện tại
          totalAmount: Number(selectedDoctor?.price) || 0,
          paymentMethod: "PAY_AT_CLINIC",
          paymentStatus: "UNPAID",
        },
        doctor: {
          id: selectedDoctor?._id ?? "",
          name: selectedDoctor?.name ?? "", // API chỉ lấy id
          avatar: selectedDoctor?.avatar ?? "", // API chỉ lấy id
          experience_year: Number(selectedDoctor?.experience_year) || 0, // API chỉ lấy id
        },
        room: {
          id: scheduleItem.roomId ?? 1,
          name: scheduleItem.roomName,
        },
        // API đang map trường 'patient' trong body request từ 'bookingData.patientId'
        // Nên object patient chi tiết ở dưới đang không được dùng
        patient: {
          fullName:
            PatientProData.find((p) => p._id === selectedPerson)?.fullName ??
            user?.fullName ??
            "",
          dateOfBirth:
            PatientProData.find((p) => p._id === selectedPerson)?.dateOfBirth ??
            user?.dateOfBirth ??
            "",
          gender:
            PatientProData.find((p) => p._id === selectedPerson)?.gender ??
            user?.gender ??
            "",
          phone:
            PatientProData.find((p) => p._id === selectedPerson)?.phone ??
            user?.phone ??
            "",
        },
        patientId: selectedPerson, // Thêm trường này để API lấy được ID bệnh nhân
      } as unknown as BookingPayload;

      // check booking data

      if (!confirm("Xác nhận đặt lịch khám!")) return false;

      await createBooking(payload);
      message.success("Đặt lịch thành công!");
      nav("/lich-kham");
    } catch (error) {
      console.log(error);
      message.error("Đặt lịch thất bại, vui lòng thử lại sau");
    }

    return true;
  };

  if (isLoading) return <div className="text-center mt-3">Loading...</div>;
  if (isError)
    return <div className="text-center mt-3">Error loading doctors</div>;

  return (
    <div className="min-h-screen bg-gray-50 my-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-3">
            <Card className="shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CalendarOutlined className="text-blue-600 text-xl" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Thông tin đặt khám
                </h2>
              </div>

              {/* Select patient */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Người tới khám (*)
                </label>
                <Select
                  value={selectedPerson}
                  onChange={handlePatientChange}
                  className="w-full"
                  size="large"
                  placeholder="Tìm kiếm..."
                  showSearch
                  filterOption={(input, option) => {
                    const label = option?.label;
                    if (typeof label === "string") {
                      return label.toLowerCase().includes(input.toLowerCase());
                    }
                    return false;
                  }}
                >
                  <Select.OptGroup label="Danh sách hồ sơ">
                    {PatientProData.map((patient) => (
                      <Select.Option
                        key={patient._id}
                        value={patient._id}
                        label={patient.fullName}
                      >
                        <div className="flex justify-between items-center gap-2">
                          <span>{patient.fullName}</span>

                          <div
                            className="flex gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              size="small"
                              type="link"
                              onClick={() => {
                                setEditingPatient(patient);
                                setIsEditing(true);
                                setShowAddPatientModal(true);
                              }}
                            >
                              Sửa
                            </Button>

                            <Button
                              size="small"
                              type="link"
                              danger
                              onClick={() => handleDeletePatient(patient._id)}
                            >
                              Xóa
                            </Button>
                          </div>
                        </div>
                      </Select.Option>
                    ))}
                    <Select.Option
                      value="add-new"
                      className="text-blue-600 font-semibold"
                    >
                      + Thêm mới người bệnh
                    </Select.Option>
                  </Select.OptGroup>
                </Select>
              </div>

              {/* Select date range */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn ngày khám
                </label>
                <RangePicker
                  placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
                  className="w-full"
                  size="large"
                  disabledDate={disabledDate}
                  value={
                    fromDate && toDate
                      ? [
                          dayjs(fromDate, "YYYY-MM-DD"),
                          dayjs(toDate, "YYYY-MM-DD"),
                        ]
                      : undefined
                  }
                  onChange={handleRangeChange}
                />
              </div>
            </Card>
          </div>

          {/* Middle - Doctor List or Schedule */}
          <div className="lg:col-span-6">
            <Card className="shadow-sm">
              {/* Search Bar */}
              <div className="mb-4">
                <Input
                  size="large"
                  placeholder="Tìm kiếm theo tên bác sĩ..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  className="flex-1"
                  maxLength={100}
                  value={inputSearch}
                  onChange={(e) => setInputSearch(e.target.value)}
                />
                <div className="my-2 flex justify-start gap-2">
                  <Button size="large" icon={<UserOutlined />}>
                    Tìm thấy
                    <span className="font-semibold">
                      {doctors.length} bác sĩ
                    </span>{" "}
                    phù hợp
                  </Button>

                  <Button size="large" onClick={handleReset}>
                    Xóa bộ lọc
                  </Button>
                </div>
              </div>

              {/* Doctor List */}
              {!selectedDoctor && (
                <DoctorList
                  doctors={doctors}
                  isFetching={isFetching}
                  handleDoctorSelect={handleDoctorSelect}
                />
              )}

              {/* Schedule View */}
              {selectedDoctor && (
                <div>
                  {/* Doctor Info */}
                  <Card className="mb-4 bg-blue-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar size={48} icon={<UserOutlined />} />
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {selectedDoctor.name}
                          </h3>
                          <p className="text-sm text-blue-600">
                            Kinh nghiệm: {selectedDoctor.experience_year} năm
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Giá khám:</p>
                          <p className="text-lg font-bold text-orange-500">
                            {selectedDoctor.price} đ
                          </p>
                        </div>
                        <Button
                          type="primary"
                          size="large"
                          onClick={handleBackToList}
                        >
                          Ẩn lịch
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Location Info */}
                  <Card className="mb-4 bg-gray-50">
                    <h3 className="font-semibold mb-3">
                      Phòng khám chuyên khoa mắt Luxury Eyes
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <EnvironmentOutlined className="text-blue-600 mt-1" />
                        <span>Địa chỉ: Vân Canh - Hoài Đức</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <HomeOutlined className="text-blue-600 mt-1" />
                        <span>
                          Phòng khám:{" "}
                          {scheduleItem ? scheduleItem.roomName : "Chưa rõ"}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">💰</span>
                        <span>
                          Giá khám:{" "}
                          <span className="text-orange-500 font-semibold">
                            {selectedDoctor.price} đ
                          </span>
                        </span>
                      </div>
                    </div>
                  </Card>

                  {/* Time Slot Picker */}
                  <TimeSlotPicker
                    scheduleItem={{
                      ...scheduleItem,
                      // timeSlots: slotsWithState,
                    }}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    selectedSchedule={selectedSlot}
                    handleTimeSelect={handleTimeSelect}
                  />
                </div>
              )}
            </Card>
          </div>

          {/* Right Sidebar - Summary */}
          <div className="lg:col-span-3">
            <Card className="shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Tóm tắt lịch khám
              </h2>

              {selectedSchedule && selectedDoctor ? (
                <div className="space-y-4">
                  {/* Doctor Info */}
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <Avatar size={48} icon={<UserOutlined />} />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {selectedDoctor?.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {selectedDoctor?.specialty}
                      </p>
                    </div>
                  </div>

                  {/* Schedule Details */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CalendarOutlined className="text-blue-600 mt-1" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Thời gian khám</p>
                        <p className="font-medium text-lg text-blue-700">
                          {selectedSchedule.displayDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <EnvironmentOutlined className="text-blue-600 mt-1" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Địa chỉ</p>
                        <p className="font-medium">
                          {selectedSchedule.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <HomeOutlined className="text-blue-600 mt-1" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Phòng khám</p>
                        <p className="font-medium">{selectedSchedule.room}</p>
                      </div>
                    </div>
                  </div>

                  {/* Symptoms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vấn đề gặp phải
                    </label>
                    <TextArea
                      rows={4}
                      maxLength={255}
                      showCount
                      placeholder="Mô tả ngắn gọn triệu chứng..."
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                    />
                  </div>

                  {/* Confirm Button */}
                  <Button
                    type="primary"
                    size="large"
                    block
                    className="bg-orange-500 hover:bg-orange-600 border-0"
                    onClick={handleConfirmBooking}
                  >
                    Xác nhận đặt khám
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <CalendarOutlined className="text-6xl text-gray-300" />
                  </div>
                  <p className="text-gray-500">
                    Vui lòng chọn bác sĩ và giờ khám để xem chi tiết.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Add/Edit Patient Modal */}
      <AddPatientModal
        visible={showAddPatientModal}
        onCancel={() => {
          setShowAddPatientModal(false);
          setEditingPatient(null);
          setIsEditing(false);
        }}
        onSubmit={handleAddPatient}
        confirmLoading={isCreatingPatient || isUpdatingPatient}
        editingPatient={editingPatient}
        isEditing={isEditing}
      />
    </div>
  );
};

export default BookingAppointmentPage;
