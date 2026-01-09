import { apiCall } from "@/app/service/apiCall";
import { ENDPOINTS } from "@/app/service/endpoints";
import { SendVideoResponse, UploadSignedData } from "@/app/types";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { addCapturedVideo } from "../groups/groupPostsSlice";

interface ArgUploadData {
  id: string;
  file_name: string;
  file_type: string;
}

interface UploadVideoArg {
  fileKeyPath: string
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


export const uploadDataToServer = createAsyncThunk<
  SendVideoResponse,
  UploadVideoArg,
  { rejectValue: string }
>(
  "video/uploadDataToServer",
  async ({ fileKeyPath }, { rejectWithValue }) => {
    try {
      const data = await apiCall<SendVideoResponse>({
        url: ENDPOINTS.TEST_APP.SEND_VIDEO,
        method: "POST",
        data: {
          file_path: fileKeyPath,
        },
      });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);


export const handleUploadCompletion = createAsyncThunk(
  "video/handleCompletion",
  async (
    payload: { fileKeyPath: string, localPath: string },
    { dispatch }
  ) => {
    let { fileKeyPath, localPath } = payload
    const response = await dispatch(
      uploadDataToServer({ fileKeyPath: fileKeyPath })
    ).unwrap();
    await dispatch(addCapturedVideo({
      tempPath: localPath, videoChatID: response.video_chat_id
    }))
    return response;
  }
);