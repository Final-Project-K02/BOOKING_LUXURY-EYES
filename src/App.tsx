// import "./App.css";
import { useEffect, useState } from "react";
import { useAppDispatch } from "./app/hook";
import AppRoute from "./routes";
import { setAuth } from "./app/features/authSlice";

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
