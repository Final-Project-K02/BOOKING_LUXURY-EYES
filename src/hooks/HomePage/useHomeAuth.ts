import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../app/hook";

type AuthModalMode = "login" | "register";

export const useHomeAuth = () => {
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>("login");

  const authState = useAppSelector((state) => state.auth);
  const hasLocalSession = Boolean(
    localStorage.getItem("accessToken") && localStorage.getItem("user"),
  );
  const isAuthenticated = authState.isAuthenticated || hasLocalSession;

  const handleNavigateWithAuth = useCallback(
    (path: string) => {
      if (!isAuthenticated) {
        setAuthModalMode("login");
        setAuthModalOpen(true);
        return;
      }

      navigate(path);
    },
    [isAuthenticated, navigate],
  );

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  return {
    authModalOpen,
    authModalMode,
    closeAuthModal,
    handleNavigateWithAuth,
  };
};
