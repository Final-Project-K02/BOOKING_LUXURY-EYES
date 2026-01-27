import AdminLayout from "../layouts/AdminLayout";
import AppointmentManagement from "../pages/admin/AppointmentManagement";
import DashBoardPage from "../pages/admin/DashBoardPage";
import DoctorManagement from "../pages/admin/Doctor-management";
import ScheduleManagement from "../pages/admin/ScheduleManagement";
import UserManagement from "../pages/admin/UserManagement";
import AdminRoute from "../Protected/Admin.Route";

const adminRoute = [
  {
    path: "admin",
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { path: "dashboard", Component: DashBoardPage },
      { path: "doctors", Component: DoctorManagement },
      { path: "appointments", Component: AppointmentManagement },
      { path: "schedule", Component: ScheduleManagement },
       { path: "user", Component: UserManagement },
    ],
  },
];

export default adminRoute;
