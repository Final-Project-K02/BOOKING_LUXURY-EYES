export interface CreatePatientInput {
  fullName: string;
  dateOfBirth?: string;
  gender: string;
  identityCard: string;
  email: string;
  phone: string;
  address: string;
}

export interface PatientResponse {
  _id: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  identityCard: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientResponse {
  data: PatientResponse;
}
export interface PatientData {
  data: PatientResponse[];
}
