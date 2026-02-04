import * as VideoThumbnails from "expo-video-thumbnails";
import { useCallback, useEffect, useRef, useState } from "react";
import { Image } from "react-native";
import { createMMKV } from "react-native-mmkv";
import { VideoNote } from "../types";

// --- Types ---
export type VideoThumbnail = {
  videoId: string;
  imagePath: string;
};

interface UseThumbnailGeneratorOptions {
  videos: VideoNote[];
  timePosition?: number;
  concurrencyLimit?: number; // New prop to control batch size
}

interface ThumbnailResult {
  isGenerating: boolean;
  getThumbnail: (videoId: string) => VideoThumbnail | undefined;
  // We expose the version so consumers can force memo re-calculation if needed
  cacheVersion: number;
}

// --- Storage Setup ---
export const mmkvStorage = createMMKV({
  id: "@video-chat-storage",
});

const getStorageKey = (videoId: string) => `thumbnail_${videoId}`;

const resolveVideoUri = (source: string | number): string => {
  if (typeof source === "number") {
    return Image.resolveAssetSource(source).uri;
  }
  return source;
};

// --- Helper: Chunk Array ---
const chunkArray = <T>(array: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

export const useThumbnailGenerator = ({
  videos,
  timePosition = 1000,
  concurrencyLimit = 3, // Default to 3 parallel generations
}: UseThumbnailGeneratorOptions): ThumbnailResult => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [cacheVersion, setCacheVersion] = useState(0);
  const generatingIds = useRef<Set<string>>(new Set());

  // 1. Single Generation Task
  const generateThumbnail = useCallback(
    async (video: VideoNote): Promise<void> => {
      const storageKey = getStorageKey(video.id);

      // Skip if exists in MMKV or currently generating
      if (
        mmkvStorage.contains(storageKey) ||
        generatingIds.current.has(video.id)
      ) {
        console.log(
          generatingIds,
          mmkvStorage.contains(storageKey),
          storageKey,
        );
        return;
      }

      if (!video.videoFile) return;

      generatingIds.current.add(video.id);

      try {
        const videoUri = resolveVideoUri(video.videoFile);

        // Generate
        const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
          time: timePosition,
          quality: 0.4,
        });
        console.log(videoUri, uri);

        // Save & Notify
        mmkvStorage.set(storageKey, uri);
        setCacheVersion((v) => v + 1);
      } catch (error) {
        console.warn(`Thumbnail failed for ${video.id}`, error);
      } finally {
        generatingIds.current.delete(video.id);
      }
    },
    [timePosition],
  );

  // 2. Orchestration (Batched)
  useEffect(() => {
    if (videos.length === 0) return;

    let isCancelled = false;

    const runFullQueueGeneration = async () => {
      // Filter: Find ALL videos that lack a thumbnail in MMKV
      const pendingVideos = videos.filter((video) => {
        const key = getStorageKey(video.id);
        const alreadyHas = mmkvStorage.contains(key);
        const isGenerating = generatingIds.current.has(video.id);
        return !alreadyHas && !isGenerating;
      });

      if (pendingVideos.length === 0) return;

      setIsGenerating(true);

      // Chunk the work into small batches (e.g., 3 at a time)
      const batches = chunkArray(pendingVideos, concurrencyLimit);

      for (const batch of batches) {
        // STOP if the component unmounted or videos array changed
        if (isCancelled) break;

        // Wait for these 3 to finish before starting the next 3
        await Promise.all(batch.map((video) => generateThumbnail(video)));
      }

      if (!isCancelled) {
        setIsGenerating(false);
      }
    };

    runFullQueueGeneration();

    // Cleanup: Stop the loop if dependencies change
    return () => {
      isCancelled = true;
    };
  }, [videos, concurrencyLimit, generateThumbnail]);

  // 3. Sync Accessor
  const getThumbnail = useCallback(
    (videoId: string): VideoThumbnail | undefined => {
      const imagePath = mmkvStorage.getString(getStorageKey(videoId));
      if (imagePath) {
        return { videoId, imagePath };
      }
      return undefined;
    },
    [cacheVersion],
  );

  return { isGenerating, getThumbnail, cacheVersion };
};

export default useThumbnailGenerator;
