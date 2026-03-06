import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./baseQuery";

type CreateVnpayPaymentRequest = {
  doctorId: string;
  scheduleId: string;
  dateTime: string;
  time: string;
  room: {
    id: number;
    name: string;
  };
  totalAmount: number;
};

type CreateVnpayPaymentResponse = {
  message: string;
  data: {
    appointmentId: string;
    depositAmount: number;
    paymentUrl: string;
    txnRef: string;
  };
};

type GetVnpayPaymentStatusResponse = {
  message: string;
  data: {
    _id: string;
    status: string;
    paymentStatus: string;
    depositAmount: number;
    totalAmount: number;
    txnRef: string;
    vnpTransactionNo: string | null;
    paidAt: string | null;
  };
};

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: createBaseQuery(),

  tagTypes: ["VnpayPayment"],
  endpoints: (builder) => ({
    createVnpayPayment: builder.mutation<
      CreateVnpayPaymentResponse,
      CreateVnpayPaymentRequest
    >({
      query: (body) => ({
        url: "/payments/vnpay/create",
        method: "POST",
        body,
      }),
    }),

    getVnpayPaymentStatus: builder.query<GetVnpayPaymentStatusResponse, string>({
      query: (txnRef) => `payments/vnpay/status/${txnRef}`,
      providesTags: (_result, _error, txnRef) => [
        { type: "VnpayPayment", id: txnRef },
      ],
    }),
  }),
});

export const {
  useCreateVnpayPaymentMutation,
  useGetVnpayPaymentStatusQuery,
} = paymentApi;