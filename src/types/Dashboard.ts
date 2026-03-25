export type AppointmentStatus = string;

export interface DoctorApi {
  _id: string;
  name?: string;
  fullName?: string;
  avatar?: string;
  specialty?: string;
  experience_year?: number;
  price?: number;
  is_active?: boolean;
}

export interface ScheduleTimeSlot {
  time: string;
  date: string;
  status: string;
  scheduleSlotId?: number;
}

export interface ScheduleApi {
  _id: string;
  doctorId?: string;
  doctor?: string;
  roomName?: string;
  roomId?: number;
  timeSlots?: ScheduleTimeSlot[];
}

export interface AppointmentDoctor {
  name?: string;
  specialty?: string;
}

export interface AppointmentPatient {
  fullName?: string;
  email?: string;
}

export interface AppointmentPatientProfile {
  fullName?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
}

export interface AppointmentApi {
  _id: string;
  dateTime: string;
  time: string;
  status: AppointmentStatus;
  doctor?: AppointmentDoctor;
  patient?: AppointmentPatient;
  patientProfile?: AppointmentPatientProfile;
}

export interface TableAppointment {
  key: string;
  patient: string;
  doctor: string;
  time: string;
  department: string;
  status: AppointmentStatus;
}

export interface UpcomingAppointment {
  name: string;
  time: string;
  date: string;
  doctor: string;
  status: string;
}

export interface DoctorWithSchedule {
  _id: string;
  name: string;
  avatar?: string;
  specialty?: string;
  experience_year?: number;
  price?: number;
  nextSlotText?: string;
  upcomingCount?: number;
  is_active?: boolean;
}

export interface DashboardStats {
  todayAppointments: number;
  newPatients: number;
  doctors: number;
  completedThisMonth: number;
}

export interface ProgressStats {
  total: number;
  completed: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  completedPercent: number;
  confirmedPercent: number;
  pendingPercent: number;
}
