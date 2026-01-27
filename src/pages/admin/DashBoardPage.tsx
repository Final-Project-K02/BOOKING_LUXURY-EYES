import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Calendar,
  Card,
  Col,
  List,
  message,
  Progress,
  Row,
  Statistic,
  Table,
  Tag,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import React, { useEffect, useState } from "react";
import api from "../../api";

type AppointmentStatus = string;

interface Doctor {
  name?: string;
  specialty?: string;
}

interface Patient {
  fullName?: string;
}

interface AppointmentApi {
  _id: string;
  dateTime: string;
  time: string;
  status: AppointmentStatus;
  doctor?: Doctor;
  patient?: Patient;
}

interface TableAppointment {
  key: string;
  patient: string;
  doctor: string;
  time: string;
  department: string;
  status: AppointmentStatus;
}

interface UpcomingAppointment {
  name: string;
  time: string;
  date: string;
  doctor: string;
}

const DashBoardPage: React.FC = () => {
  const [appointments, setAppointments] = useState<TableAppointment[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingAppointment[]>([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    newPatients: 0,
    doctors: 0,
    completedThisMonth: 0,
  });

  const fetchDashboard = async () => {
    try {
      const [appointmentRes, doctorRes, patientRes] = await Promise.all([
        api.get("/appointments"),
        api.get("/doctors"),
        api.get("/patients"),
      ]);

      const appointmentsData: AppointmentApi[] = appointmentRes.data.data || [];
      const doctorsData = doctorRes.data.data || [];
      const patientsData = patientRes.data.data || [];

      const today = dayjs().format("YYYY-MM-DD");

      setStats({
        todayAppointments: appointmentsData.filter(
          (a) => dayjs(a.dateTime).format("YYYY-MM-DD") === today
        ).length,
        newPatients: patientsData.length,
        doctors: doctorsData.length,
        completedThisMonth: appointmentsData.filter(
          (a) =>
            a.status === "Completed" ||
            (a.status === "COMPLETED" &&
              dayjs(a.dateTime).isSame(dayjs(), "month"))
        ).length,
      });

      setAppointments(
        appointmentsData.slice(0, 5).map((a) => ({
          key: a._id,
          patient: a.patient?.fullName || "—",
          doctor: a.doctor?.name || "—",
          time: `${a.time} - ${dayjs(a.dateTime).format("DD/MM/YYYY")}`,
          department: a.doctor?.specialty || "—",
          status: a.status,
        }))
      );

     setUpcoming(
  appointmentsData
    .filter((a) => dayjs(a.dateTime).isAfter(dayjs()))
    .sort((a, b) =>
      dayjs(a.dateTime).valueOf() - dayjs(b.dateTime).valueOf()
    )
    .slice(0, 5)
    .map((a) => ({
      name: a.patient?.fullName || "—",
      time: a.time,
      date: dayjs(a.dateTime).format("DD/MM/YYYY"),
      doctor: a.doctor?.name || "—",
    }))
);

    } catch {
      message.error("Không tải được dữ liệu dashboard");
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

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
    { title: "Chuyên khoa", dataIndex: "department" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: AppointmentStatus) => {
        const map: Record<string, { color: string; text: string }> = {
          Pending: { color: "orange", text: "Chờ xác nhận" },
          Confirmed: { color: "green", text: "Đã xác nhận" },
          Completed: { color: "blue", text: "Hoàn thành" },
          Cancelled: { color: "red", text: "Đã huỷ" },
          CONFIRMED: { color: "green", text: "Đã xác nhận" },
          COMPLETED: { color: "blue", text: "Hoàn thành" },
          CANCELLED: { color: "red", text: "Đã huỷ" },
        };

        const config = map[status] ?? {
          color: "default",
          text: status || "Không rõ",
        };

        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  const dateCellRender = (value: Dayjs) => {
    const count = appointments.filter(
      (a) =>
        dayjs(a.time.split(" - ")[1], "DD/MM/YYYY").date() === value.date()
    ).length;

    return count ? <Badge status="success" text={`${count} lịch hẹn`} /> : null;
  };

  return (
    <>
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
              prefix={<TeamOutlined />}
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

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card title="Lịch hẹn gần đây" style={{ marginBottom: 16 }}>
            <Table
              columns={columns}
              dataSource={appointments}
              pagination={false}
            />
          </Card>

          <Card title="Tỷ lệ hoàn thành (demo)">
            <Progress percent={90} />
            <Progress percent={85} />
            <Progress percent={78} />
          </Card>
        </Col>

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
