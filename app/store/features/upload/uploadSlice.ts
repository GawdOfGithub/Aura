import { UploadSignedData } from "@/app/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index"; // specific to your project
import { fetchPresignedUrl } from "./uploadThunk";

export enum UploadStatus {
  PREPARING = "PREPARING", // Waiting for either File OR URL
  PENDING = "PENDING", // Ready to Upload (Has BOTH)
  UPLOADING = "UPLOADING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface VideoItem {
  id: string;
  localUri?: string; // Optional until recording finishes
  status: UploadStatus;
  retryCount: number;
  createdAt: number;
  isCompressed: boolean;
  // Server Data
  serverFileUuid?: string;
  uploadUrl?: string;
  s3Key?: string;
  uploadHeaders?: Record<string, string>;
}

const initialState = {
  queue: [] as string[],
  entities: {} as Record<string, VideoItem>,
};

const uploadSlice = createSlice({
  name: "upload",
  initialState,
  reducers: {
    enqueueVideo: (
      state,
      action: PayloadAction<{ id: string; uri: string }>
    ) => {
      const { id, uri } = action.payload;

      // If entity exists (URL fetched first), update it. If not, create it.
      if (!state.entities[id]) {
        state.entities[id] = {
          id,
          localUri: uri,
          status: UploadStatus.PREPARING,
          retryCount: 0,
          createdAt: Date.now(),
          isCompressed: false
        };
      } else {
        state.entities[id].localUri = uri;
        if (state.entities[id].uploadUrl) {
          state.entities[id].status = UploadStatus.PENDING;
        }
      }

      if (!state.queue.includes(id)) {
        state.queue.push(id);
      }
    },

    markUploading: (state, action: PayloadAction<string>) => {
      if (state.entities[action.payload]) {
        state.entities[action.payload].status = UploadStatus.UPLOADING;
      }
    },
    compressionSuccess: (state, action: PayloadAction<{ id: string; newUri: string }>) => {
      const { id, newUri } = action.payload;
      if (state.entities[id]) {
        state.entities[id].localUri = newUri;
        state.entities[id].isCompressed = true;
      }
    },
    uploadSuccess: (
      state,
      action: PayloadAction<{ id: string; key: string }>
    ) => {
      const { id, key } = action.payload;
      state.queue = state.queue.filter((itemId) => itemId !== id);
      if (state.entities[id]) {
        state.entities[id].status = UploadStatus.COMPLETED;
        state.entities[id].s3Key = key;
      }
    },
    uploadFailure: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      const item = state.entities[id];
      if (!item) return;

      if (item.retryCount < 3) {
        item.status = UploadStatus.PENDING; // Retry
        item.retryCount += 1;
      } else {
        state.queue = state.queue.filter((itemId) => itemId !== id);
        item.status = UploadStatus.FAILED;
      }
    },
    retryFailed: (state) => {
      Object.values(state.entities).forEach((item) => {
        if (item.status === UploadStatus.FAILED) {
          item.status = UploadStatus.PENDING;
          item.retryCount = 0;
          if (!state.queue.includes(item.id)) {
            state.queue.push(item.id);
          }
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPresignedUrl.fulfilled, (state, action) => {
        const { id } = action.meta.arg;
        const data = action.payload;

        if (!state.entities[id]) {
          state.entities[id] = {
            id,
            status: UploadStatus.PREPARING, // Wait for Video
            retryCount: 0,
            createdAt: Date.now(),
            isCompressed: false,
            serverFileUuid: data.file_uuid,
            uploadUrl: data.url,
            s3Key: data.key,
            uploadHeaders: data.headers,
          };
        } else {
          state.entities[id].serverFileUuid = data.file_uuid;
          state.entities[id].uploadUrl = data.url;
          state.entities[id].s3Key = data.key;
          state.entities[id].uploadHeaders = data.headers;

          // CHECK: Do we have the Video File already?
          if (state.entities[id].localUri) {
            state.entities[id].status = UploadStatus.PENDING;
          }
        }
      })
      .addCase(fetchPresignedUrl.rejected, (state, action) => {
        const { id } = action.meta.arg;
        if (state.entities[id]) {
          state.entities[id].status = UploadStatus.FAILED;
          state.queue = state.queue.filter((qId) => qId !== id);
        }
      });
  },
});

export const { enqueueVideo, markUploading, compressionSuccess, uploadSuccess, uploadFailure } =
  uploadSlice.actions;

export const selectNextJobId = (state: RootState) => state.upload.queue[0]; // Peek first item
export const selectItemById = (state: RootState, id: string) =>
  state.upload.entities[id];

export const getUploadConfigById = (
  state: RootState,
  id: string
): UploadSignedData => {
  const videoItem = state.upload.entities[id];
  if (
    !videoItem.serverFileUuid ||
    !videoItem.uploadUrl ||
    !videoItem.s3Key ||
    !videoItem.uploadHeaders
  ) {
    throw new Error(`Upload config incomplete for video ${id}`);
  }

  return {
    file_uuid: videoItem.serverFileUuid,
    url: videoItem.uploadUrl,
    key: videoItem.s3Key,
    headers: videoItem.uploadHeaders,
  };
};
export const selectQueueLength = (state: RootState) =>
  state.upload.queue.length;
export default uploadSlice.reducer;
