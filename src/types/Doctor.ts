export interface Doctor {
  _id: string;
  name: string;
  avatar?: string;
  specialty: string;
  price: number;
  description: string;
  experience_year: number;
  createdAt: string;
  is_active?: boolean;
  email?: string;
  phone?: string;
}

export interface DoctorResponse {
  data: Doctor[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DoctorFilter {
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  experience_year?: number;
}

export interface DoctorFormValues {
  name: string;
  avatar?: string;
  price: number;
  experience_year: number;
  email?: string;
  phone?: string;
  description?: string;
}
