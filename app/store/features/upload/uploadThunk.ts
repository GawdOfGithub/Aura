import { apiCall } from "@/app/service/apiCall";
import { ENDPOINTS } from "@/app/service/endpoints";
import { UploadSignedData } from "@/app/types";
import { createAsyncThunk } from "@reduxjs/toolkit";

interface ArgUploadData {
  id: string;
  file_name: string;
  file_type: string;
}

export const fetchPresignedUrl = createAsyncThunk<
  UploadSignedData,
  ArgUploadData,
  { rejectValue: string }
>("upload/getPresignedURL", async (uploadData, { rejectWithValue }) => {
  try {
    const data = await apiCall<UploadSignedData>({
      url: ENDPOINTS.TEST_APP.GET_PRESIGNED_URL,
      method: "POST",
      data: uploadData,
    });
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});
