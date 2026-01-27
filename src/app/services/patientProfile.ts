import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { PatientInput } from "../../components/BookingAppointment/AddPatientModal";
import type {
  CreatePatientResponse,
  PatientData,
} from "../../types/PatientProfile";
import type { RootState } from "../store";

export const patientProfileApi = createApi({
  reducerPath: "patientProfileApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://api-class-o1lo.onrender.com/api/luxury_eyes/",
    prepareHeaders: (headers, { getState }) => {
      const token =
        (getState() as RootState).auth.accessToken ||
        localStorage.getItem("accessToken");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["PatientProfiles"],
  endpoints: (builder) => ({
    getPatientProfile: builder.query<PatientData, void>({
      query: () => "patient-profile",
      providesTags: ["PatientProfiles"],
    }),

    createPatientProfile: builder.mutation<CreatePatientResponse, PatientInput>(
      {
        query: (body) => ({
          url: "patient-profile",
          method: "POST",
          body,
        }),
        invalidatesTags: ["PatientProfiles"],
      },
    ),
  }),
});

export const { useGetPatientProfileQuery, useCreatePatientProfileMutation } =
  patientProfileApi;
