import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as FileSystem from "expo-file-system/legacy";
import { VideoChat } from "../../../types/serverResponse"; // Import your types
import { RootState } from "../../index"; // Import your store's RootState type

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

// --- Thunks ---

/**
 * 1. Initialize: Loads from AsyncStorage, deletes expired files from disk, updates state.
 */
export const initializeVideos = createAsyncThunk(
    "videos/initialize",
    async (_, { rejectWithValue }) => {
        try {
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
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
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(validVideos));
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

/**
 * 2. Add Video: Moves temp file to permanent storage and saves metadata.
 */
export const addCapturedVideo = createAsyncThunk(
    "videos/add",
    async (
        payload: { tempPath: string; userId: string },
        { getState, rejectWithValue }
    ) => {
        try {
            const { tempPath, userId } = payload;
            const fileName = tempPath.split("/").pop();
            if (!fileName) throw new Error("Invalid filename");

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
                id: `temp_${Date.now()}`,
                videoCapturedAt: new Date().toISOString(),
                videoCapturedBy: userId,
                videoFilePath: permanentPath,
            };

            // Get current list to update AsyncStorage
            const state = getState() as RootState;
            const currentVideos = state.videos.videos;
            const updatedList = [newVideo, ...currentVideos];

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

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
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
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

            await AsyncStorage.removeItem(STORAGE_KEY);
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
export const selectVideosLast24Hours = (state: RootState) => {
    const videos = state.videos.videos;
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    return videos.filter(
        (v) => new Date(v.videoCapturedAt).getTime() > twentyFourHoursAgo
    );
};