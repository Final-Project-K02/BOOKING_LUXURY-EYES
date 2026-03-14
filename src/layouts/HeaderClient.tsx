import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Button, Drawer, Dropdown, Menu } from "antd";
import { Link } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/imgs/logoEye.png";
import AuthModal from "../components/auth/AuthModal";
import { useAuthHandler } from "../hooks/useAuthHandler";
import { useAppSelector } from "../app/hook";

const HeaderClient = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">(
    "login",
  );
  const { handleLogout } = useAuthHandler();

  const { user, isAuthenticated, accessToken } = useAppSelector(
    (state) => state.auth,
  );
  const isLoggedIn = Boolean(user && isAuthenticated && accessToken);

  const menuItems: MenuProps["items"] = [];

  const openAuthModal = (mode: "login" | "register") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const guestMenu: MenuProps["items"] = [
    {
      key: "login",
      label: "Đăng nhập",
      onClick: () => openAuthModal("login"),
    },
    {
      key: "register",
      label: "Đăng ký",
      onClick: () => openAuthModal("register"),
    },
  ];

  const loggedMenu: MenuProps["items"] = [
    {
      key: "logout",
      label: <span style={{ color: "red" }}>Đăng xuất</span>,
      onClick: () => {
        void handleLogout({ showMessage: true, redirect: "/" });
      },
    },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="bg-blue-900 text-white py-2 px-4">
        <div className="container mx-auto flex flex-wrap justify-between items-center text-sm">
          <div className="flex flex-wrap gap-4">
            <span className="flex items-center gap-1">
              <PhoneOutlined /> Hotline: 024.3574.8181
            </span>
            <span className="flex items-center gap-1">
              <ClockCircleOutlined /> 24/7
            </span>
          </div>
          <div className="flex items-center gap-1">
            <EnvironmentOutlined /> Hà Nội
          </div>
        </div>
      </div>

      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img src={logo} alt="logo" className="w-28 h-auto" />
            </Link>

            <nav className="hidden lg:block flex-1 mx-8">
              <Menu
                mode="horizontal"
                className="border-0 justify-center"
                items={menuItems}
              />
            </nav>

            {/* Desktop Menu */}
            <div className="hidden md:block">
              {!isLoggedIn ? (
                <Dropdown
                  menu={{
                    items: guestMenu,
                  }}
                  placement="bottomRight"
                  arrow
                >
                  <Button icon={<UserOutlined />}>Tài khoản</Button>
                </Dropdown>
              ) : (
                <Dropdown
                  menu={{
                    items: loggedMenu,
                  }}
                  placement="bottomRight"
                  arrow
                >
                  <Button icon={<UserOutlined />}>
                    {user?.fullName || "Tài khoản"}
                  </Button>
                </Dropdown>
              )}
            </div>

            {/* Mobile Menu Icon */}
            <Button
              type="text"
              icon={<UserOutlined />}
              className="md:hidden"
              onClick={() => setDrawerVisible(true)}
            />
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        <Menu mode="vertical" items={menuItems} className="border-0" />

        <div className="mt-4 px-4 space-y-2">
          {!isLoggedIn ? (
            <>
              <Button
                type="primary"
                block
                onClick={() => {
                  openAuthModal("login");
                  setDrawerVisible(false);
                }}
              >
                Đăng nhập
              </Button>

              <Button
                block
                onClick={() => {
                  openAuthModal("register");
                  setDrawerVisible(false);
                }}
              >
                Đăng ký
              </Button>
            </>
          ) : (
            <>
              <Link to="/profile">
                <Button block>Thông tin cá nhân</Button>
              </Link>

              <Button
                danger
                block
                onClick={() => {
                  void handleLogout({ showMessage: true, redirect: "/" });
                  setDrawerVisible(false);
                }}
              >
                Đăng xuất
              </Button>
            </>
          )}
        </div>
      </Drawer>

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authModalMode}
      />
    </>
  );
};

export default HeaderClient;
