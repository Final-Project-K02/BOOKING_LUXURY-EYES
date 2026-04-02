export interface User {
  _id: string;
  email: string;
  password?: string;
  fullName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  identityCard: string;
  phone: string;
  address: string;
  role: "admin" | "user";
}

export interface LoginPayload {
  email: string;
  password: string;
}
