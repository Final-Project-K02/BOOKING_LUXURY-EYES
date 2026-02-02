export interface Doctor {
  _id: string;
  name: string;
  avatar?: string;
  specialty: string;
  price: number;
  description: string;
  experience_year: number;
  createdAt: string;
}

export interface DoctorResponse {
  data: Doctor[];
}

