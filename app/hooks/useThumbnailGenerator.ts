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
  currentIndex: number;
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
  currentIndex,
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
        return;
      }

      if (!video.videoPath) return;

      generatingIds.current.add(video.id);

      try {
        const videoUri = resolveVideoUri(video.videoPath);

        // Generate
        const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
          time: timePosition,
          quality: 0.7,
        });

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

    const runBatchGeneration = async () => {
      // A. Identify what NEEDS generation within lookahead
      const videosToGenerate: VideoNote[] = [];
      const end = Math.min(currentIndex, videos.length - 1);

      for (let i = currentIndex; i <= end; i++) {
        const video = videos[i];
        const storageKey = getStorageKey(video.id);

        // Only queue if not in storage and not currently generating
        if (
          video &&
          !mmkvStorage.contains(storageKey) &&
          !generatingIds.current.has(video.id)
        ) {
          videosToGenerate.push(video);
        }
      }

      if (videosToGenerate.length === 0) return;

      setIsGenerating(true);

      // B. Split into chunks (e.g., groups of 3)
      const batches = chunkArray(videosToGenerate, concurrencyLimit);

      // C. Process batches sequentially
      for (const batch of batches) {
        // Process items inside the batch in parallel
        await Promise.all(batch.map((video) => generateThumbnail(video)));
      }

      setIsGenerating(false);
    };

    runBatchGeneration();
  }, [currentIndex, videos, concurrencyLimit, generateThumbnail]);

  // 3. Sync Accessor
  const getThumbnail = useCallback(
    (videoId: string): VideoThumbnail | undefined => {
      const imagePath = mmkvStorage.getString(getStorageKey(videoId));
      if (imagePath) {
        return { videoId, imagePath };
      }
      return undefined;
    },
    [],
  );

  return { isGenerating, getThumbnail, cacheVersion };
};

export default useThumbnailGenerator;
