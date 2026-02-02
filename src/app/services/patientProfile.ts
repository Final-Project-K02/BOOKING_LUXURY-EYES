import { createApi } from "@reduxjs/toolkit/query/react";
import type { PatientInput } from "../../components/BookingAppointment/AddPatientModal";
import type {
  CreatePatientResponse,
  PatientData,
} from "../../types/PatientProfile";
import { createBaseQuery } from "./baseQuery";

export const patientProfileApi = createApi({
  reducerPath: "patientProfileApi",
  baseQuery: createBaseQuery(),
  tagTypes: ["PatientProfiles"],
  endpoints: (builder) => ({
    getPatientProfile: builder.query<PatientData, void>({
      query: () => "patient-profile",
      providesTags: ["PatientProfiles"],
    }),

    getPatientProfileById: builder.query<CreatePatientResponse, string>({
      query: (id) => `patient-profile/${id}`,
      providesTags: (result, _, id) =>
        result ? [{ type: "PatientProfiles", id }] : ["PatientProfiles"],
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

    updatePatientProfile: builder.mutation<
      CreatePatientResponse,
      { id: string; body: Partial<PatientInput> }
    >({
      query: ({ id, body }) => ({
        url: `patient-profile/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["PatientProfiles"],
    }),

    deletePatientProfile: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `patient-profile/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PatientProfiles"],
    }),
  }),
});

export const {
  useGetPatientProfileQuery,
  useGetPatientProfileByIdQuery,
  useCreatePatientProfileMutation,
  useUpdatePatientProfileMutation,
  useDeletePatientProfileMutation,
} = patientProfileApi;
