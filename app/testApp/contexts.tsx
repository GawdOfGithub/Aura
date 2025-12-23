import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { VideoChat } from "../types";

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

interface VideoContextData {
  videos: VideoMetadata[];
  isLoading: boolean;
  addCapturedVideo: (tempPath: string, userId: string) => Promise<void>;
  syncRemoteVideos: (remoteVideos: VideoChat[]) => Promise<void>;
  getVideosLast24Hours: () => VideoMetadata[];
  deleteAllVideos: () => Promise<void>;
}

// --- Context Creation ---
const VideoStorageContext = createContext<VideoContextData | undefined>(
  undefined
);

// --- Provider Component ---
export const VideoStorageProvider = ({ children }: { children: ReactNode }) => {
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load videos on mount
  useEffect(() => {
    loadAndCleanupVideos();
  }, []);

  const loadAndCleanupVideos = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (!saved) {
        setIsLoading(false);
        return;
      }

      const parsedVideos: VideoMetadata[] = JSON.parse(saved);
      const now = Date.now();

      const validVideos: VideoMetadata[] = [];
      const expiredVideos: VideoMetadata[] = [];

      // 1. Separate Valid vs Expired
      parsedVideos.forEach((video) => {
        const videoTime = new Date(video.videoCapturedAt).getTime();
        if (now - videoTime > EXPIRATION_TIME_MS) {
          expiredVideos.push(video);
        } else {
          validVideos.push(video);
        }
      });

      // 2. Delete Expired Files from Disk
      if (expiredVideos.length > 0) {
        console.log(
          `[Cleanup] Removing ${expiredVideos.length} expired videos...`
        );
        await Promise.all(
          expiredVideos.map(async (video) => {
            try {
              await FileSystem.deleteAsync(video.videoFilePath, {
                idempotent: true,
              });
            } catch (err) {
              console.warn(
                `[Cleanup] Failed to delete file: ${video.videoFilePath}`,
                err
              );
            }
          })
        );

        // 3. Update Storage with only valid videos
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(validVideos));
      }

      // 4. Update State
      // Sort newest first
      const sorted = validVideos.sort(
        (a, b) =>
          new Date(b.videoCapturedAt).getTime() -
          new Date(a.videoCapturedAt).getTime()
      );
      setVideos(sorted);
    } catch (e) {
      console.error("Failed to load/cleanup videos", e);
    } finally {
      setIsLoading(false);
    }
  };

  const addCapturedVideo = async (tempFilePath: string, userId: string) => {
    try {
      // Create permanent path
      const fileName = tempFilePath.split("/").pop();
      if (!fileName) throw new Error("Invalid filename");

      const permanentPath = `${FileSystem.documentDirectory}${fileName}`;

      // Copy file (using copyAsync prevents iOS permissions errors)
      await FileSystem.copyAsync({
        from: tempFilePath,
        to: permanentPath,
      });

      // Try to clean up temp file (silent fail if needed)
      try {
        await FileSystem.deleteAsync(tempFilePath, { idempotent: true });
      } catch (e) {
        console.log("Temp file cleanup skipped");
      }
      // Create new metadata object
      const newVideo: VideoMetadata = {
        id: `temp_${Date.now()}`,
        videoCapturedAt: new Date().toISOString(),
        videoCapturedBy: userId,
        videoFilePath: permanentPath,
      };

      // Update State & Storage
      const updatedList = [newVideo, ...videos];
      setVideos(updatedList);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.error("Failed to add video", e);
      throw e;
    }
  };
  const syncRemoteVideos = async (remoteVideos: VideoChat[]) => {
    try {
      const now = Date.now();
      const newVideosToAdd: VideoMetadata[] = [];
      const cleanLocalVideos = videos.filter(
        (v) => !String(v.id).startsWith("temp_")
      );
      // Create a Set of existing IDs for O(1) lookup
      const existingIds = new Set(videos.map((v) => v.id));

      // Filter videos we need to download
      const videosToDownload = remoteVideos.filter((remoteVideo) => {
        const remoteIdStr = String(remoteVideo.id);
        const createdAtTime = new Date(remoteVideo.created_at).getTime();
        const isExpired = now - createdAtTime > EXPIRATION_TIME_MS;

        // Condition: Must not exist locally AND must not be expired
        return !existingIds.has(remoteIdStr) && !isExpired;
      });

      if (videosToDownload.length === 0) return; // Nothing to do

      console.log(
        `[Sync] Downloading ${videosToDownload.length} new videos...`
      );

      // Download files in parallel
      await Promise.all(
        videosToDownload.map(async (v) => {
          try {
            // Define a local path.
            // NOTE: Ensure your API URLs have file extensions, or append .mp4 manually
            const fileName = `remote_${v.id}.mp4`;
            const localUri = `${FileSystem.documentDirectory}${fileName}`;

            // Download from URL to Local File System
            const downloadResult = await FileSystem.downloadAsync(
              v.video_path,
              localUri
            );

            if (downloadResult.status === 200) {
              newVideosToAdd.push({
                id: String(v.id),
                videoCapturedAt: v.created_at,
                videoCapturedBy: String(v.created_by),
                videoFilePath: localUri, // Save the local path, not the URL
              });
            }
          } catch (err) {
            console.error(`[Sync] Failed to download video ${v.id}`, err);
          }
        })
      );

      if (newVideosToAdd.length > 0) {
        // Merge with existing videos
        const updatedList = [...newVideosToAdd, ...cleanLocalVideos];

        // Sort
        const sorted = updatedList.sort(
          (a, b) =>
            new Date(b.videoCapturedAt).getTime() -
            new Date(a.videoCapturedAt).getTime()
        );

        setVideos(sorted);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
        console.log(
          `[Sync] Successfully added ${newVideosToAdd.length} videos.`
        );
      }
    } catch (e) {
      console.error("Error syncing remote videos", e);
    }
  };
  const getVideosLast24Hours = () => {
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    return videos
      .filter((v) => new Date(v.videoCapturedAt).getTime() > twentyFourHoursAgo)
      .sort(
        (a, b) =>
          new Date(a.videoCapturedAt).getTime() -
          new Date(b.videoCapturedAt).getTime()
      );
  };

  const deleteAllVideos = async () => {
    try {
      console.log(`[DeleteAll] Removing ${videos.length} videos...`);

      // 1. Delete all physical files
      await Promise.all(
        videos.map(async (video) => {
          try {
            await FileSystem.deleteAsync(video.videoFilePath, {
              idempotent: true,
            });
          } catch (err) {
            console.warn(
              `[DeleteAll] Failed to delete: ${video.videoFilePath}`
            );
          }
        })
      );

      // 2. Clear State
      setVideos([]);

      // 3. Clear Metadata Storage
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Failed to delete all videos", e);
      throw e;
    }
  };
  // --- FINAL RETURN ---
  // If you had a 'return' before this line, the code below would be unreachable.
  return (
    <VideoStorageContext.Provider
      value={{
        videos,
        isLoading,
        addCapturedVideo,
        syncRemoteVideos,
        getVideosLast24Hours,
        deleteAllVideos,
      }}>
      {children}
    </VideoStorageContext.Provider>
  );
};

// --- Custom Hook ---
export const useVideosStorage = () => {
  const context = useContext(VideoStorageContext);
  if (!context) {
    throw new Error(
      "useVideosStorage must be used within a VideoStorageProvider"
    );
  }
  return context;
};
