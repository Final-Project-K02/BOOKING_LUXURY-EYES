import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { message } from "antd";
import type { LoginPayload, User } from "../types/User";
import { authService, handleAuthError } from "../app/services/authApi";
import { setAuth } from "../app/features/authSlice";
import type { ForgotPasswordPayload } from "../types/Auth";

export const useAuthHandler = () => {
  const nav = useNavigate();
  const dispatch = useDispatch();

  const handleRegister = async (values: User): Promise<boolean> => {
    try {
      const payload = {
        fullName: values.fullName,
        email: values.email,
        password: values.password!, // Password is required in form, so it exists
      };
      await authService.register(payload);
      message.success("Đăng ký thành công");
      return true;
    } catch (error) {
      const errorMessage = handleAuthError(error);
      message.error(errorMessage);
      console.error("Register Error:", error);
      return false;
    }
  };

  const handleLogin = async (values: LoginPayload): Promise<boolean> => {
    try {
      console.log(values);
      const res = await authService.login({
        email: values.email,
        password: values.password,
      });
      // Xử lý response không có `success` field
      const data = res.data.data || res.data;
      const { user, accessToken } = data;

      if (!user || !accessToken) {
        message.error("Dữ liệu đăng nhập không hợp lệ");
        return false;
      }

      dispatch(setAuth({ user, accessToken }));
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") {
        nav("/admin/dashboard");
      } else {
        nav("/");
      }

      message.success("Đăng nhập thành công!");
      return true;
    } catch (error) {
      const errorMessage = handleAuthError(error);
      message.error(errorMessage);
      console.error("Login Error:", error);
      return false;
    }
  };

  const handleForgotPassword = async (
    values: ForgotPasswordPayload,
  ): Promise<boolean> => {
    try {
      await authService.forgotPassword({
        email: values.email,
      });
      message.success("Link reset mật khẩu đã được gửi đến email của bạn");
      return true;
    } catch (error) {
      const errorMessage = handleAuthError(error);
      message.error(errorMessage);
      console.error("Forgot Password Error:", error);
      return false;
    }
  };

  const handleResetPassword = async (payload: {
    token: string;
    password: string;
  }): Promise<boolean> => {
    try {
      await authService.resetPassword(payload);
      message.success("Mật khẩu đã được reset thành công");
      return true;
    } catch (error) {
      const errorMessage = handleAuthError(error);
      message.error(errorMessage);
      console.error("Reset Password Error:", error);
      return false;
    }
  };

  return {
    handleRegister,
    handleLogin,
    handleForgotPassword,
    handleResetPassword,
  };
};
