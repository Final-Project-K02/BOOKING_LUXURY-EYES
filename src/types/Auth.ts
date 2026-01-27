export interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  mode: "login" | "register";
}

export type AuthMode = "login" | "register" | "forgot";

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  password: string;
  confirmPassword: string;
  token: string;
}
