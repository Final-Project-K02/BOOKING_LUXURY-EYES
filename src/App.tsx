// import "./App.css";
import { useEffect, useState } from "react";
import { useAppDispatch } from "./app/hook";
import AppRoute from "./routes";
import { setAuth } from "./app/features/authSlice";
import { message } from "antd";

function App() {
  const dispatch = useAppDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");

    if (token && user) {
      dispatch(
        setAuth({
          accessToken: token,
          user: JSON.parse(user),
        }),
      );
    }

    if (sessionStorage.getItem("accountLockedNotice") === "1") {
      sessionStorage.removeItem("accountLockedNotice");
      message.warning(
        "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
      );
    }

    setIsInitialized(true);
  }, [dispatch]);

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <AppRoute />
    </>
  );
}

export default App;
