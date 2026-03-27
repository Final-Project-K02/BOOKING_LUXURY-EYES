import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authSlice } from "./features/authSlice";
import { authApi } from "./services/authApi";
import { appointmentApi } from "./services/appointmentApi";
import { doctorApi } from "./services/doctorApi";
import { patientProfileApi } from "./services/patientProfile";
import { scheduleApi } from "./services/scheduleApi";
import { paymentApi } from "./services/paymentApi";
import { uploadApi } from "./services/uploadApi";
export const store = configureStore({
  reducer: {
    //rtk query
    [authApi.reducerPath]: authApi.reducer,
    [doctorApi.reducerPath]: doctorApi.reducer,
    [scheduleApi.reducerPath]: scheduleApi.reducer,
    [patientProfileApi.reducerPath]: patientProfileApi.reducer,

    [appointmentApi.reducerPath]: appointmentApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [uploadApi.reducerPath]: uploadApi.reducer,
    // rtk
    auth: authSlice.reducer,
  },

  middleware: (getDeFault) =>
    getDeFault()
      .concat(authApi.middleware)
      .concat(doctorApi.middleware)
      .concat(scheduleApi.middleware)
      .concat(patientProfileApi.middleware)
      .concat(appointmentApi.middleware)
      .concat(paymentApi.middleware)
      .concat(uploadApi.middleware),
  // quản lý cache và tag
});

setupListeners(store.dispatch); //kích hoạt các listener để hỗ trợ các tính năng nâng cao của RTK Query: refetchOnFocus, refetchOnReconnect

export type RootState = ReturnType<typeof store.getState>; //kiểu dữ liệu toàn bộ state của store
export type AppDispatch = typeof store.dispatch; //kiểu dữ liệu của dispatch, dùng cho useDispatch và middleware
