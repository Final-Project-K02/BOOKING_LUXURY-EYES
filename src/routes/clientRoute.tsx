import ClientLayout from "../layouts/ClientLayout";
import AppointmentHistoryPage from "../pages/client/AppointmentHistoryPage";
import BookingAppointmentPage from "../pages/client/BookingAppointmentPage";
import HomePage from "../pages/client/HomePage";
import PaymentResultPage from "../pages/client/PaymentResultPage";
import ProtectedRoute from "../Protected/AuthRoutes";

const clientRoute = [
  {
    path: "/",
    element: <ClientLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "dat-lich-kham",
        element: (
          <ProtectedRoute>
            <BookingAppointmentPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "lich-kham",
        element: (
          <ProtectedRoute>
            <AppointmentHistoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "payment/vnpay-result",
        element: <PaymentResultPage />,
      },
    ],
  },
];

export default clientRoute;
