import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./baseQuery";

type UploadResponse = {
  message: string;
  data: {
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
  };
};

export const uploadApi = createApi({
  reducerPath: "uploadApi",
  baseQuery: createBaseQuery(),
  endpoints: (builder) => ({
    uploadImage: builder.mutation<UploadResponse, { file: File; folder?: string }>({
      query: ({ file, folder }) => {
        const form = new FormData();
        form.append("image", file);
        if (folder) form.append("folder", folder);

        return {
          url: "/uploads/image",
          method: "POST",
          body: form,
        };
      },
    }),
  }),
});

export const { useUploadImageMutation } = uploadApi;