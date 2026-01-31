import { createApi } from "@reduxjs/toolkit/query/react";
import type { PatientInput } from "../../components/BookingAppointment/AddPatientModal";
import type {
  CreatePatientResponse,
  PatientData,
} from "../../types/PatientProfile";
import { createBaseQuery } from "./baseQuery";

export const patientProfileApi = createApi({
  reducerPath: "patientProfileApi",
  baseQuery: createBaseQuery(
    "https://api-class-o1lo.onrender.com/api/luxury_eyes/",
  ),
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
