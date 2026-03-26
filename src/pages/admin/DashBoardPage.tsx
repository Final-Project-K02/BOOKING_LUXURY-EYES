import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Calendar,
  Card,
  Col,
  List,
  Progress,
  Row,
  Statistic,
  Table,
  Tag,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import React, { useEffect } from "react";
import { APPOINTMENT_STATUS_MAP } from "../../constants/admin/dashboardContants";
import { useDashboard } from "../../hooks/admin/useDashboard";
import type { TableAppointment } from "../../types/Dashboard";

// ===== TABLE COLUMNS =====
const columns = [
  {
    title: "Bệnh nhân",
    render: (_: unknown, r: TableAppointment) => (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Avatar icon={<UserOutlined />} />
        {r.patient}
      </div>
    ),
  },
  { title: "Bác sĩ", dataIndex: "doctor" },
  { title: "Thời gian", dataIndex: "time" },
  {
    title: "Trạng thái",
    dataIndex: "status",
    render: (status: string) => {
      const config = APPOINTMENT_STATUS_MAP[status] ?? {
        color: "default",
        text: status || "Không rõ",
      };
      return <Tag color={config.color}>{config.text}</Tag>;
    },
  },
];

// ===== PAGE =====

const DashBoardPage: React.FC = () => {
  const { stats, progressStats, appointments, upcoming, fetchDashboard } =
    useDashboard();

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dateCellRender = (value: Dayjs) => {
    const count = appointments.filter(
      (a) =>
        dayjs(a.time.split(" - ")[1], "DD/MM/YYYY").date() === value.date(),
    ).length;
    return count ? <Badge status="success" text={`${count} lịch hẹn`} /> : null;
  };

  return (
    <>
      {/* ===== STATS CARDS ===== */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12} lg={6}>
          <Card>
            <Statistic
              title="Lịch hẹn hôm nay"
              value={stats.todayAppointments}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card>
            <Statistic
              title="Bệnh nhân"
              value={stats.newPatients}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card>
            <Statistic
              title="Bác sĩ"
              value={stats.doctors}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card>
            <Statistic
              title="Ca khám hoàn thành"
              value={stats.completedThisMonth}
              prefix={<CheckCircleOutlined />}
              suffix="tháng"
            />
          </Card>
        </Col>
      </Row>
      {/* ===== MAIN CONTENT ===== */}
      <Row gutter={16}>
        {/* Left: Table + Progress */}
        <Col xs={24} lg={16}>
          <Card title="Lịch hẹn gần đây" style={{ marginBottom: 16 }}>
            <Table
              columns={columns}
              dataSource={appointments}
              pagination={false}
            />
          </Card>
          <Card title="Tỷ lệ xử lý lịch hẹn">
            <div style={{ marginBottom: 16, color: "#666" }}>
              Tổng số lịch hẹn: <strong>{progressStats.total}</strong>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ marginBottom: 6 }}>
                Hoàn thành ({progressStats.completed}/{progressStats.total})
              </div>
              <Progress
                percent={progressStats.completedPercent}
                status="active"
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ marginBottom: 6 }}>
                Đã xác nhận ({progressStats.confirmed}/{progressStats.total})
              </div>
              <Progress percent={progressStats.confirmedPercent} />
            </div>
            <div>
              <div style={{ marginBottom: 6 }}>
                Chờ xác nhận ({progressStats.pending}/{progressStats.total})
              </div>
              <Progress percent={progressStats.pendingPercent} />
            </div>
          </Card>
        </Col>
        {/* Right: Upcoming list + Calendar */}
        <Col xs={24} lg={8}>
          <Card title="Lịch hẹn sắp tới" style={{ marginBottom: 16 }}>
            <List
              dataSource={upcoming}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={item.name}
                    description={
                      <>
                        <div>
                          <ClockCircleOutlined /> {item.time} – {item.date}
                        </div>
                        <div>{item.doctor}</div>
                        <div style={{ marginTop: 4 }}>
                          <Tag
                            color={
                              APPOINTMENT_STATUS_MAP[item.status]?.color ??
                              "default"
                            }
                          >
                            {APPOINTMENT_STATUS_MAP[item.status]?.text ??
                              item.status}
                          </Tag>
                        </div>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
          <Card title="Lịch tháng">
            <Calendar fullscreen={false} dateCellRender={dateCellRender} />
          </Card>
        </Col>
      </Row>
    </>
  );
};
export default DashBoardPage;
