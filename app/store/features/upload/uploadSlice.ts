import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index"; // specific to your project

export enum UploadStatus {
  PENDING = "PENDING",
  UPLOADING = "UPLOADING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface VideoItem {
  id: string; // UUID
  localUri: string;
  status: UploadStatus;
  retryCount: number;
  s3Key?: string;
  createdAt: number;
}

interface UploadState {
  queue: string[]; // Ordered List of IDs (FIFO)
  entities: Record<string, VideoItem>; // Normalized Data
}

const initialState: UploadState = {
  queue: [],
  entities: {},
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
      state.entities[id] = {
        id,
        localUri: uri,
        status: UploadStatus.PENDING,
        retryCount: 0,
        createdAt: Date.now(),
      };
      state.queue.push(id);
    },
    markUploading: (state, action: PayloadAction<string>) => {
      if (state.entities[action.payload]) {
        state.entities[action.payload].status = UploadStatus.UPLOADING;
      }
    },
    uploadSuccess: (
      state,
      action: PayloadAction<{ id: string; key: string }>
    ) => {
      const { id, key } = action.payload;
      // Remove from queue
      state.queue = state.queue.filter((itemId) => itemId !== id);
      // Update entity (Keep in history if needed, or delete)
      if (state.entities[id]) {
        state.entities[id].status = UploadStatus.COMPLETED;
        state.entities[id].s3Key = key;
      }
    },
    uploadFailure: (state, action: PayloadAction<{ id: string }>) => {
      const id = action.payload.id;
      const item = state.entities[id];
      if (!item) return;

      if (item.retryCount < 3) {
        // Soft Failure: Reset to Pending, keep in queue (will retry next loop)
        item.status = UploadStatus.PENDING;
        item.retryCount += 1;
      } else {
        // Hard Failure: Remove from active queue, Mark Failed
        state.queue = state.queue.filter((itemId) => itemId !== id);
        item.status = UploadStatus.FAILED;
      }
    },
    // Useful for "Retry All" button in UI
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
});

export const {
  enqueueVideo,
  markUploading,
  uploadSuccess,
  uploadFailure,
  retryFailed,
} = uploadSlice.actions;

// Selectors
export const selectNextJobId = (state: RootState) => state.upload.queue[0]; // Peek first item
export const selectItemById = (state: RootState, id: string) =>
  state.upload.entities[id];
export const selectQueueLength = (state: RootState) =>
  state.upload.queue.length;

export default uploadSlice.reducer;
