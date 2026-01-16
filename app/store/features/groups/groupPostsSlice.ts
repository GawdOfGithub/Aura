import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import * as FileSystem from "expo-file-system/legacy";
import { VideoChat } from "../../../types/serverResponse"; // Import your types
import { RootState } from "../../index"; // Import your store's RootState type
import { mmkvStorage } from "../../../storage/mmkvStorage";

// --- Configuration ---
const STORAGE_KEY = "@captured_videos_metadata";
const EXPIRATION_TIME_MS = 24 * 60 * 60 * 1000; // 24 Hours

// --- Types ---
export interface VideoMetadata {
    id: string;
    videoCapturedAt: string;
    videoCapturedBy: string;
    videoFilePath: string;
}

interface VideoState {
    videos: VideoMetadata[];
    isLoading: boolean;
    error: string | null;
}

const initialState: VideoState = {
    videos: [],
    isLoading: false,
    error: null,
};


export const initializeVideos = createAsyncThunk(
    "videos/initialize",
    async (_, { rejectWithValue }) => {
        try {
            const saved = mmkvStorage.getString(STORAGE_KEY);
            if (!saved) return [];

            const parsedVideos: VideoMetadata[] = JSON.parse(saved);
            const now = Date.now();
            const validVideos: VideoMetadata[] = [];
            const expiredVideos: VideoMetadata[] = [];

            // Separate Valid vs Expired
            parsedVideos.forEach((video) => {
                const videoTime = new Date(video.videoCapturedAt).getTime();
                if (now - videoTime > EXPIRATION_TIME_MS) {
                    expiredVideos.push(video);
                } else {
                    validVideos.push(video);
                }
            });

            // Delete Expired Files from Disk
            if (expiredVideos.length > 0) {
                console.log(`[Cleanup] Removing ${expiredVideos.length} expired videos...`);
                await Promise.all(
                    expiredVideos.map(async (video) => {
                        try {
                            await FileSystem.deleteAsync(video.videoFilePath, { idempotent: true });
                        } catch (err) {
                            console.warn(`[Cleanup] Failed to delete: ${video.videoFilePath}`, err);
                        }
                    })
                );
                // Update Storage immediately with cleaned list
                mmkvStorage.set(STORAGE_KEY, JSON.stringify(validVideos));
            }

            // Return sorted list
            return validVideos.sort(
                (a, b) => new Date(b.videoCapturedAt).getTime() - new Date(a.videoCapturedAt).getTime()
            );
        } catch (error: any) {
            console.error("Failed to initialize videos", error);
            return rejectWithValue(error.message);
        }
    }
);

export const addCapturedVideo = createAsyncThunk(
    "videos/add",
    async (
        payload: { tempPath: string; videoChatID: string },
        { getState, rejectWithValue }
    ) => {
        try {
            const { tempPath, videoChatID } = payload;
            const fileName = tempPath.split("/").pop();
            if (!fileName) throw new Error("Invalid filename");
            const state = getState() as RootState;
            let selfUserID = state.user.data ? state.user.data.id : ""
            const permanentPath = `${FileSystem.documentDirectory}${fileName}`;

            // Copy file to permanent location
            await FileSystem.copyAsync({ from: tempPath, to: permanentPath });

            // Clean up temp file
            try {
                await FileSystem.deleteAsync(tempPath, { idempotent: true });
            } catch (e) {
                /* silent fail */
            }

            const newVideo: VideoMetadata = {
                id: videoChatID,
                videoCapturedAt: new Date().toISOString(),
                videoCapturedBy: selfUserID,
                videoFilePath: permanentPath,
            };


            const currentVideos = state.videos.videos;
            const updatedList = [newVideo, ...currentVideos];

            mmkvStorage.set(STORAGE_KEY, JSON.stringify(updatedList));

            return newVideo;
        } catch (error: any) {
            console.error("Failed to add video", error);
            return rejectWithValue(error.message);
        }
    }
);

/**
 * 3. Sync: Downloads remote videos that don't exist locally.
 */
export const syncRemoteVideos = createAsyncThunk(
    "videos/sync",
    async (remoteVideos: VideoChat[], { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const localVideos = state.videos.videos;

            const now = Date.now();
            const newVideosToAdd: VideoMetadata[] = [];
            const existingIds = new Set(localVideos.map((v) => v.id));

            // Filter videos to download
            const videosToDownload = remoteVideos.filter((remoteVideo) => {
                const remoteIdStr = String(remoteVideo.id);
                const createdAtTime = new Date(remoteVideo.created_at).getTime();
                const isExpired = now - createdAtTime > EXPIRATION_TIME_MS;
                return !existingIds.has(remoteIdStr) && !isExpired;
            });

            if (videosToDownload.length === 0) return [];

            console.log(`[Sync] Downloading ${videosToDownload.length} videos...`);

            await Promise.all(
                videosToDownload.map(async (v) => {
                    try {
                        const fileName = `remote_${v.id}.mp4`;
                        const localUri = `${FileSystem.documentDirectory}${fileName}`;

                        const downloadResult = await FileSystem.downloadAsync(
                            v.video_path,
                            localUri
                        );

                        if (downloadResult.status === 200) {
                            newVideosToAdd.push({
                                id: String(v.id),
                                videoCapturedAt: v.created_at,
                                videoCapturedBy: String(v.created_by),
                                videoFilePath: localUri,
                            });
                        }
                    } catch (err) {
                        console.error(`[Sync] Failed video ${v.id}`, err);
                    }
                })
            );

            if (newVideosToAdd.length > 0) {
                // Save merged list to storage
                const updatedList = [...newVideosToAdd, ...localVideos].sort(
                    (a, b) => new Date(b.videoCapturedAt).getTime() - new Date(a.videoCapturedAt).getTime()
                );
                mmkvStorage.set(STORAGE_KEY, JSON.stringify(updatedList));
            }

            return newVideosToAdd;
        } catch (error: any) {
            console.error("Sync failed", error);
            return rejectWithValue(error.message);
        }
    }
);

/**
 * 4. Delete All: Wipes files and storage.
 */
export const deleteAllVideos = createAsyncThunk(
    "videos/deleteAll",
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const videos = state.videos.videos;

            console.log(`[DeleteAll] Removing ${videos.length} videos...`);

            await Promise.all(
                videos.map(async (video) => {
                    try {
                        await FileSystem.deleteAsync(video.videoFilePath, { idempotent: true });
                    } catch (err) {
                        console.warn(`Failed to delete: ${video.videoFilePath}`);
                    }
                })
            );

            mmkvStorage.remove(STORAGE_KEY);
            return [];
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// --- Slice ---

const videoSlice = createSlice({
    name: "videos",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Initialize
        builder.addCase(initializeVideos.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(initializeVideos.fulfilled, (state, action) => {
            state.isLoading = false;
            state.videos = action.payload;
        });
        builder.addCase(initializeVideos.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Add Video
        builder.addCase(addCapturedVideo.fulfilled, (state, action) => {
            state.videos.unshift(action.payload); // Add to top
        });

        // Sync Videos
        builder.addCase(syncRemoteVideos.fulfilled, (state, action) => {
            if (action.payload.length > 0) {
                state.videos = [...action.payload, ...state.videos].sort(
                    (a, b) => new Date(b.videoCapturedAt).getTime() - new Date(a.videoCapturedAt).getTime()
                );
            }
        });

        // Delete All
        builder.addCase(deleteAllVideos.fulfilled, (state) => {
            state.videos = [];
        });
    },
});

export default videoSlice.reducer;

// --- Selectors ---

export const selectAllVideos = (state: RootState) => state.videos.videos;
export const selectIsVideoLoading = (state: RootState) => state.videos.isLoading;

// Memoized selector for last 24h
export const selectVideosLast24Hours = createSelector(
    [selectAllVideos], // Input selectors
    (videos) => {
        // This calculation only runs if 'videos' has changed
        const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

        return videos.filter(
            (v) => new Date(v.videoCapturedAt).getTime() > twentyFourHoursAgo
        );
    }
);