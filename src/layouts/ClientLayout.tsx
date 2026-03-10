import { useEffect, useMemo, useState } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import ResetPasswordModal from "../components/auth/ResetPasswordModal";
import FooterClient from "./FooterClient";
import HeaderClient from "./HeaderClient";

const ClientLayout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const resetToken = useMemo(
    () => searchParams.get("token") ?? "",
    [searchParams],
  );

  useEffect(() => {
    if (resetToken) {
      setResetModalOpen(true);
    }
  }, [resetToken]);

  const closeResetModal = () => {
    setResetModalOpen(false);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("token");

    const nextSearch = nextParams.toString();
    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : "",
      },
      { replace: true },
    );
  };

  return (
    <div>
      <HeaderClient />
      <Outlet />
      <FooterClient />
      <ResetPasswordModal
        open={resetModalOpen}
        token={resetToken}
        onClose={closeResetModal}
      />
    </div>
  );
};

export default ClientLayout;
