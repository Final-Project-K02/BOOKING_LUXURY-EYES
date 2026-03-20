import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Calendar,
  Card,
  Col,
  Input,
  List,
  message,
  Progress,
  Row,
  Statistic,
  Table,
  Tag,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";

type AppointmentStatus = string;

interface DoctorApi {
  _id: string;
  name?: string;
  fullName?: string;
  avatar?: string;
  specialty?: string;
  experience_year?: number;
  price?: number;
  is_active?: boolean;
}

interface ScheduleApi {
  _id: string;
  doctorId?: string;
  doctor?: string;
  roomName?: string;
  roomId?: number;
  timeSlots?: Array<{
    time: string;
    date: string;
    status: string;
    scheduleSlotId?: number;
  }>;
}

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

type DoctorWithSchedule = {
  _id: string;
  name: string;
  avatar?: string;
  specialty?: string;
  experience_year?: number;
  price?: number;
  nextSlotText?: string;
  upcomingCount?: number;
  is_active?: boolean;
};

type ProgressStats = {
  total: number;
  completed: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  completedPercent: number;
  confirmedPercent: number;
  pendingPercent: number;
};

const DashBoardPage: React.FC = () => {
  const nav = useNavigate();

  const [appointments, setAppointments] = useState<TableAppointment[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingAppointment[]>([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    newPatients: 0,
    doctors: 0,
    completedThisMonth: 0,
  });

  const [progressStats, setProgressStats] = useState<ProgressStats>({
    total: 0,
    completed: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    completedPercent: 0,
    confirmedPercent: 0,
    pendingPercent: 0,
  });

  const [doctorsWithSchedule, setDoctorsWithSchedule] = useState<
    DoctorWithSchedule[]
  >([]);
  const [loadingDoctorsSchedule, setLoadingDoctorsSchedule] = useState(false);
  const [searchDoctor, setSearchDoctor] = useState("");

  const normalizeStatus = (status?: string) =>
    (status || "").trim().toUpperCase();

  const fetchDashboard = async () => {
    try {
      const [appointmentRes, doctorRes, patientRes] = await Promise.all([
        api.get("/appointments"),
        api.get("/doctors"),
        api.get("/patient-profile"),
      ]);

      const appointmentsData: AppointmentApi[] = appointmentRes.data.data || [];
      const doctorsData: DoctorApi[] = doctorRes.data.data || [];
      const patientsData = patientRes.data.data || [];

      const today = dayjs().format("YYYY-MM-DD");

      const completedThisMonthCount = appointmentsData.filter((a) => {
        const status = normalizeStatus(a.status);
        return (
          status === "COMPLETED" && dayjs(a.dateTime).isSame(dayjs(), "month")
        );
      }).length;

      setStats({
        todayAppointments: appointmentsData.filter(
          (a) => dayjs(a.dateTime).format("YYYY-MM-DD") === today,
        ).length,
        newPatients: patientsData.length,
        doctors: doctorsData.length,
        completedThisMonth: completedThisMonthCount,
      });

      setAppointments(
        appointmentsData.slice(0, 5).map((a) => ({
          key: a._id,
          patient: a.patient?.fullName || "—",
          doctor: a.doctor?.name || "—",
          time: `${a.time} - ${dayjs(a.dateTime).format("DD/MM/YYYY")}`,
          department: a.doctor?.specialty || "—",
          status: a.status,
        })),
      );

      setUpcoming(
        appointmentsData
          .filter((a) => dayjs(a.dateTime).isAfter(dayjs()))
          .sort(
            (a, b) => dayjs(a.dateTime).valueOf() - dayjs(b.dateTime).valueOf(),
          )
          .slice(0, 5)
          .map((a) => ({
            name: a.patient?.fullName || "—",
            time: a.time,
            date: dayjs(a.dateTime).format("DD/MM/YYYY"),
            doctor: a.doctor?.name || "—",
          })),
      );

      // Tính progress từ dữ liệu thật
      const total = appointmentsData.length;
      const completed = appointmentsData.filter(
        (a) => normalizeStatus(a.status) === "COMPLETED",
      ).length;
      const confirmed = appointmentsData.filter(
        (a) => normalizeStatus(a.status) === "CONFIRMED",
      ).length;
      const pending = appointmentsData.filter(
        (a) => normalizeStatus(a.status) === "PENDING",
      ).length;
      const cancelled = appointmentsData.filter(
        (a) => normalizeStatus(a.status) === "CANCELLED",
      ).length;

      const percent = (value: number, totalValue: number) =>
        totalValue > 0 ? Math.round((value / totalValue) * 100) : 0;

      setProgressStats({
        total,
        completed,
        confirmed,
        pending,
        cancelled,
        completedPercent: percent(completed, total),
        confirmedPercent: percent(confirmed, total),
        pendingPercent: percent(pending, total),
      });

      // fetch “doctors with schedule”
      await fetchDoctorsWithSchedule(doctorsData);
    } catch (err) {
      console.log(err);
      message.error("Không tải được dữ liệu dashboard");
    }
  };

  const fetchSchedulesByDoctor = async (doctorId: string) => {
    const res = await api.get("/schedules", { params: { doctorId } });
    return (res.data?.data ?? []) as ScheduleApi[];
  };

  const fetchDoctorsWithSchedule = async (doctorsData: DoctorApi[]) => {
    try {
      setLoadingDoctorsSchedule(true);

      const activeDoctors = (doctorsData || []).filter(
        (d) => d.is_active !== false,
      );

      const LIMIT = 10;
      const pick = activeDoctors.slice(0, LIMIT);

      const results = await Promise.all(
        pick.map(async (doc) => {
          try {
            const schedules = await fetchSchedulesByDoctor(doc._id);

            const futureSlots: Array<{ time: string; date: string }> = [];

            schedules.forEach((s) => {
              (s.timeSlots || []).forEach((ts) => {
                const dt = dayjs(ts.date);
                if (dt.isAfter(dayjs().startOf("day"))) {
                  futureSlots.push({ time: ts.time, date: ts.date });
                }
              });
            });

            futureSlots.sort(
              (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf(),
            );

            const next = futureSlots[0];

            return {
              _id: doc._id,
              name: doc.name || doc.fullName || "Bác sĩ",
              avatar: doc.avatar,
              specialty: doc.specialty,
              experience_year: doc.experience_year,
              price: doc.price,
              is_active: doc.is_active,
              upcomingCount: futureSlots.length,
              nextSlotText: next
                ? `${next.time} • ${dayjs(next.date).format("DD/MM")}`
                : undefined,
            } as DoctorWithSchedule;
          } catch {
            return {
              _id: doc._id,
              name: doc.name || doc.fullName || "Bác sĩ",
              avatar: doc.avatar,
              specialty: doc.specialty,
              experience_year: doc.experience_year,
              price: doc.price,
              is_active: doc.is_active,
              upcomingCount: 0,
              nextSlotText: undefined,
            } as DoctorWithSchedule;
          }
        }),
      );

      const filtered = results
        .filter((d) => (d.upcomingCount || 0) > 0)
        .sort((a, b) => (b.upcomingCount || 0) - (a.upcomingCount || 0));

      setDoctorsWithSchedule(filtered);
    } finally {
      setLoadingDoctorsSchedule(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToBooking = (doctorId: string) => {
    nav(`/dat-lich-kham?doctorId=${doctorId}`);
  };

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
          PENDING: { color: "orange", text: "Chờ xác nhận" },
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
        dayjs(a.time.split(" - ")[1], "DD/MM/YYYY").date() === value.date(),
    ).length;

    return count ? <Badge status="success" text={`${count} lịch hẹn`} /> : null;
  };

  const filteredDoctors = useMemo(() => {
    const q = searchDoctor.trim().toLowerCase();
    if (!q) return doctorsWithSchedule;
    return doctorsWithSchedule.filter((d) =>
      (d.name || "").toLowerCase().includes(q),
    );
  }, [doctorsWithSchedule, searchDoctor]);

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

      {/* <Card
        style={{ marginBottom: 16 }}
        title="Bác sĩ có lịch khám"
        extra={
          <Input
            allowClear
            placeholder="Tìm bác sĩ..."
            prefix={<SearchOutlined />}
            value={searchDoctor}
            onChange={(e) => setSearchDoctor(e.target.value)}
            style={{ width: 260 }}
          />
        }
        loading={loadingDoctorsSchedule}
      >
        {filteredDoctors.length === 0 ? (
          <div style={{ color: "#888" }}>
            Chưa có bác sĩ nào có lịch khám sắp tới.
          </div>
        ) : (
          <Row gutter={[12, 12]}>
            {filteredDoctors.slice(0, 8).map((d) => (
              <Col xs={24} sm={12} md={8} lg={6} key={d._id}>
                <Card
                  hoverable
                  onClick={() => goToBooking(d._id)}
                  style={{
                    borderRadius: 12,
                    border: "1px solid #f0f0f0",
                    height: "100%",
                  }}
                >
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <Avatar size={56} src={d.avatar} icon={<UserOutlined />} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {d.name}
                      </div>
                      <div style={{ color: "#666", fontSize: 12 }}>
                        {d.specialty || "Chưa rõ chuyên khoa"}
                      </div>
                      <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Tag color="blue" style={{ marginInlineEnd: 0 }}>
                          {d.nextSlotText ? `Gần nhất: ${d.nextSlotText}` : "Chưa có"}
                        </Tag>
                        <Tag color="green" style={{ marginInlineEnd: 0 }}>
                          {d.upcomingCount || 0} lịch
                        </Tag>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 10, color: "#999", fontSize: 12 }}>
                    Nhấn để xem lịch và đặt khám
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card> */}

      <Row gutter={16}>
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
