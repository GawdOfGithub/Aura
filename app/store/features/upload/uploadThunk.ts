import { apiCall } from "@/app/service/apiCall";
import { ENDPOINTS } from "@/app/service/endpoints";
import { CreatePostResponse, UploadSignedData } from "@/app/types";
import { createAsyncThunk } from "@reduxjs/toolkit";

interface ArgUploadData {
  id: string;
  file_name: string;
  file_type: string;
  chat_id: string;
}

interface CreatePostArg {
  camera_id: string;
  s3_path: string;
  file_type?: string;
  reference_id: string;
}

export const fetchPresignedUrl = createAsyncThunk<
  UploadSignedData,
  ArgUploadData,
  { rejectValue: string }
>("upload/getPresignedURL", async (uploadData, { rejectWithValue }) => {
  try {
    const data = await apiCall<UploadSignedData>({
      url: ENDPOINTS.POST.GET_PRESIGNED_URL,
      method: "POST",
      data: uploadData,
    });
    return { ...data, chat_id: uploadData.chat_id };
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const uploadDataToServer = createAsyncThunk<
  CreatePostResponse,
  CreatePostArg,
  { rejectValue: string }
>("video/uploadDataToServer", async (createPostData, { rejectWithValue }) => {
  try {
    const data = await apiCall<CreatePostResponse>({
      url: ENDPOINTS.POST.CREATE_POST,
      method: "POST",
      data: createPostData,
    });
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

// to update local context and call server
export const handleUploadCompletion = createAsyncThunk(
  "video/handleCompletion",
  async (payload: CreatePostArg, { dispatch }) => {
    console.log(payload);
    const response: CreatePostResponse = await dispatch(
      uploadDataToServer(payload),
    ).unwrap();
    //TBD update local
    // await dispatch(
    //   addCapturedVideo({
    //     tempPath: localPath,
    //     videoChatID: response.video_chat_id,
    //   }),
    // );
    return response;
  },
);
