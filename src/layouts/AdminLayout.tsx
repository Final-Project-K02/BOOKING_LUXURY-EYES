import {
  CalendarOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  EyeOutlined,
  LogoutOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { ConfigProvider, Layout, Menu } from "antd";
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
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      {/* Sử dụng ConfigProvider để tùy chỉnh giao diện Menu bên trong 
          cho đẹp hơn (Menu items sẽ có dạng viên thuốc bo tròn)
      */}
      <ConfigProvider
        theme={{
          components: {
            Menu: {
              // Màu chữ khi chưa chọn (mờ nhẹ)
              itemColor: "rgba(255, 255, 255, 0.7)",
              // Màu chữ khi hover
              itemHoverColor: "#fff",
              // Màu nền khi được chọn (Màu trắng nổi bật)
              itemSelectedBg: "#fff",
              // Màu chữ khi được chọn (Màu xanh thương hiệu)
              itemSelectedColor: "#0284C7",
              // Bo tròn các item trong menu
              itemBorderRadius: 8,
              // Khoảng cách giữa các item
              itemMarginInline: 8,
            },
          },
        }}
      >
        <Sider
          breakpoint="lg"
          collapsedWidth="0"
          width={260}
          style={{
            // ===== CÁC THAY ĐỔI STYLE CHO SIDEBAR =====
            margin: "12px 0 12px 12px", // Tạo khoảng cách để sidebar "nổi"
            height: "calc(100vh - 24px)", // Chiều cao trừ đi margin
            borderRadius: "16px", // Bo tròn góc sidebar
            background: "linear-gradient(180deg, #0EA5E9 0%, #0284C7 100%)", // Màu Gradient
            boxShadow: "4px 0 24px rgba(0,0,0,0.15)", // Đổ bóng
            overflow: "hidden", // Để nội dung không bị tràn ra ngoài góc bo
            position: "sticky",
            top: 12,
            left: 0,
            border: "none",
          }}
          trigger={null}
        >
          {/* LOGO */}
          <div
            style={{
              height: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 22,
              fontWeight: "800",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              marginBottom: 16,
              letterSpacing: "0.5px",
            }}
          >
            <EyeOutlined style={{ marginRight: 10, fontSize: 28 }} />
            Luxury Eyes
          </div>

          {/* MENU */}
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            // Background transparent để hiện màu gradient của Sider
            style={{ background: "transparent", borderRight: "none" }}
            onClick={({ key }) => {
              if (key) navigate(key);
            }}
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
              // Tạo khoảng cách lớn hoặc divider trước nút đăng xuất
              {
                type: "divider",
                style: { margin: "24px 16px", borderColor: "rgba(255,255,255,0.2)" },
              },
              {
                key: "logout", // Đổi key để tránh navigate nhầm
                icon: <LogoutOutlined />,
                label: "Đăng xuất",
                style: { color: "#ffcfcf" }, // Màu đỏ nhạt cho cảnh báo
                onClick: handleLogout,
              },
            ]}
          />
        </Sider>
      </ConfigProvider>

      {/* ===== MAIN ===== */}
      <Layout style={{ background: "transparent" }}>
        {/* HEADER */}
        <Header
          style={{
            background: "#fff",
            margin: "12px 12px 0 12px", // Margin để khớp với sidebar
            padding: "0 24px",
            borderRadius: 12, // Bo tròn header
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <h3 style={{ margin: 0, color: "#0369A1", fontWeight: 700 }}>
            Admin – Phòng khám mắt
          </h3>
          {/* Có thể thêm Avatar admin ở đây */}
        </Header>

        {/* CONTENT */}
        <Content
          style={{
            margin: "16px 12px 12px 12px", // Căn chỉnh lề
            padding: 24,
            background: "#fff",
            borderRadius: 12, // Bo tròn content
            minHeight: 280,
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            overflow: "initial",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;