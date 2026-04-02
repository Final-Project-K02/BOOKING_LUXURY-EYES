import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { message as staticMessage, App as AntdApp } from "antd";
import type { LoginPayload, User } from "../types/User";
import {
  useRegisterMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
  PASSWORD_REGEX,
} from "../app/services/authApi";
import { setAuth, logout as logoutAction } from "../app/features/authSlice";
import type { ForgotPasswordPayload } from "../types/Auth";

export const useAuthHandler = () => {
  // Try to get context-aware message, fallback to static if not available
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let message: any = staticMessage;
  try {
    const app = AntdApp.useApp();
    if (app?.message) {
      message = app.message;
    }
  } catch {
    // If useApp fails, use static message as fallback
    message = staticMessage;
  }

  const nav = useNavigate();
  const dispatch = useDispatch();

  const [registerMutation] = useRegisterMutation();
  const [loginMutation] = useLoginMutation();
  const [forgotPasswordMutation] = useForgotPasswordMutation();
  const [resetPasswordMutation] = useResetPasswordMutation();
  const [logoutMutation] = useLogoutMutation();

  const handleRegister = async (values: User): Promise<boolean> => {
    try {
      await registerMutation({
        fullName: values.fullName,
        email: values.email,
        password: values.password!,
      }).unwrap();
      message.success("Đăng ký thành công");
      return true;
    } catch (error) {
      const err = error as { data?: { message?: string } };
      message.error(err.data?.message || "Có lỗi xảy ra, vui lòng thử lại");
      console.error("Register Error:", error);
      return false;
    }
  };

  const handleLogin = async (values: LoginPayload): Promise<boolean> => {
    try {
      const res = await loginMutation({
        email: values.email,
        password: values.password,
      }).unwrap();

      const data =
        res.data || (res as unknown as { user: User; accessToken: string });
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
      const err = error as { data?: { message?: string } };
      message.error(err.data?.message || "Có lỗi xảy ra, vui lòng thử lại");
      return false;
    }
  };

  const handleForgotPassword = async (
    values: ForgotPasswordPayload,
  ): Promise<boolean> => {
    try {
      await forgotPasswordMutation({ email: values.email }).unwrap();
      message.success("Link reset mật khẩu đã được gửi đến email của bạn");
      return true;
    } catch (error) {
      const err = error as { data?: { message?: string } };
      message.error(err.data?.message || "Có lỗi xảy ra, vui lòng thử lại");
      console.error("Forgot Password Error:", error);
      return false;
    }
  };

  const handleResetPassword = async (payload: {
    token: string;
    password: string;
  }): Promise<boolean> => {
    try {
      await resetPasswordMutation({
        token: payload.token,
        newPassword: payload.password,
      }).unwrap();
      message.success("Mật khẩu đã được reset thành công");
      return true;
    } catch (error) {
      const err = error as { data?: { message?: string } };
      message.error(err.data?.message || "Có lỗi xảy ra, vui lòng thử lại");
      console.error("Reset Password Error:", error);
      return false;
    }
  };

  const handleLogout = async (options?: {
    redirect?: string;
    showMessage?: boolean;
    messageText?: string;
  }): Promise<void> => {
    try {
      await logoutMutation().unwrap();
    } catch {
      // Still clear client state even if server logout fails.
    } finally {
      dispatch(logoutAction());
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      if (options?.showMessage) {
        message.success(options.messageText ?? "Đăng xuất thành công!");
      }

      nav(options?.redirect ?? "/");
    }
  };

  return {
    handleRegister,
    handleLogin,
    handleForgotPassword,
    handleResetPassword,
    handleLogout,
  };
};

export { PASSWORD_REGEX };
