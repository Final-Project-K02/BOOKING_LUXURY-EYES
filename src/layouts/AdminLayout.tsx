import {
  CalendarOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  EyeOutlined,
  LogoutOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../app/features/authSlice";
import { useAppDispatch } from "../app/hook";

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/auth");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* ===== SIDEBAR ===== */}
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{ background: "#0EA5E9" }}
      >
        {/* LOGO */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 20,
            fontWeight: "bold",
          }}
        >
          <EyeOutlined style={{ marginRight: 8 }} />
          Luxury Eyes
        </div>

        {/* MENU */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ background: "#0284C7" }}
          onClick={({ key }) => navigate(key)}
          items={[
            {
              key: "/admin/dashboard",
              icon: <DashboardOutlined />,
              label: "Tổng quan",
            },

            {
              key: "/admin/appointments",
              icon: <CalendarOutlined />,
              label: "Lịch hẹn",
            },

            // {
            //   key: "/admin/patients",
            //   icon: <UserOutlined />,
            //   label: "Bệnh nhân",
            // },
            {
              key: "/admin/schedule",
              icon: <ClockCircleOutlined />,
              label: "Lịch của bác sĩ",
            },
            {
              key: "/admin/doctors",
              icon: <TeamOutlined />,
              label: "Bác sĩ",
            },
            {
              key: "/admin/user",
              icon: <TeamOutlined />,
              label: "Người dùng",
            },
            {
              key: "login",
              icon: <LogoutOutlined />,
              label: "Đăng xuất",
              danger: true,
              onClick: handleLogout,
            },
          ]}
        />
      </Sider>

      {/* ===== MAIN ===== */}
      <Layout>
        {/* HEADER */}
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ margin: 0, color: "#0369A1" }}>
            Admin – Phòng khám mắt
          </h3>
        </Header>

        {/* CONTENT */}
        <Content
          style={{
            margin: 16,
            padding: 24,
            background: "#f0f2f5",
            borderRadius: 8,
          }}
        >
          {/* 👉 PAGE CON SẼ RENDER Ở ĐÂY */}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
