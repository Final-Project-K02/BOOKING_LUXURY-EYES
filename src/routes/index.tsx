import { createBrowserRouter, RouterProvider } from "react-router-dom";
import clientRoute from "./clientRoute";
import adminRoute from "./adminRoute";
import NotFoundPage from "../pages/admin/NotFoundPage";

const route = createBrowserRouter([
  ...clientRoute,
  ...adminRoute,
  { path: "*", Component: NotFoundPage },
]);

const AppRoute = () => {
  return <RouterProvider router={route} />;
};

export default AppRoute;
