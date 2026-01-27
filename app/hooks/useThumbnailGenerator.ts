import * as VideoThumbnails from "expo-video-thumbnails";
import { useCallback, useEffect, useRef, useState } from "react";
import { Image } from "react-native";
import { MinimalVideoItem } from "../types";

export interface VideoItem {
  id: string;
  videoUri: string | number;
}

interface UseThumbnailGeneratorOptions {
  videos: MinimalVideoItem[];
  currentIndex: number;
  lookahead?: number;
  timePosition?: number;
}

interface ThumbnailResult {
  thumbnails: Map<string, string>;
  isGenerating: boolean;
  getThumbnail: (videoId: string) => string | undefined;
}

const resolveVideoUri = (source: string | number): string => {
  if (typeof source === "number") {
    return Image.resolveAssetSource(source).uri;
  }
  return source;
};

export const useThumbnailGenerator = ({
  videos,
  currentIndex,
  lookahead = 4,
  timePosition = 1000,
}: UseThumbnailGeneratorOptions): ThumbnailResult => {
  const thumbnailCache = useRef<Map<string, string>>(new Map());
  const [thumbnails, setThumbnails] = useState<Map<string, string>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);
  const generatingIds = useRef<Set<string>>(new Set());

  const generateThumbnail = useCallback(
    async (video: MinimalVideoItem): Promise<void> => {
      if (
        thumbnailCache.current.has(video.videoId) ||
        generatingIds.current.has(video.videoId)
      ) {
        return;
      }

      if (!video.videoPath) {
        return;
      }

      generatingIds.current.add(video.videoId);

      try {
        const videoUri = resolveVideoUri(video.videoPath);
        const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
          time: timePosition,
        });
        thumbnailCache.current.set(video.videoId, uri);
        setThumbnails(new Map(thumbnailCache.current));
      } catch (error) {
        console.warn(
          `Failed to generate thumbnail for video ${video.videoId}:`,
          error,
        );
      } finally {
        generatingIds.current.delete(video.videoId);
      }
    },
    [timePosition],
  );

  useEffect(() => {
    if (videos.length === 0) return;

    const generateUpcoming = async () => {
      setIsGenerating(true);

      const indicesToGenerate: number[] = [];

      if (lookahead >= videos.length) {
        for (let i = 0; i < videos.length; i++) {
          indicesToGenerate.push(i);
        }
      } else {
        for (let i = 0; i <= lookahead; i++) {
          const nextIndex = (currentIndex + i) % videos.length;
          if (!indicesToGenerate.includes(nextIndex)) {
            indicesToGenerate.push(nextIndex);
          }
        }
      }

      const promises = indicesToGenerate.map((index) => {
        const video = videos[index];
        if (video) {
          return generateThumbnail(video);
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      setIsGenerating(false);
    };

    generateUpcoming();
  }, [currentIndex, videos, lookahead, generateThumbnail]);

  const getThumbnail = useCallback(
    (videoId: string): string | undefined => {
      return thumbnails.get(videoId);
    },
    [thumbnails],
  );

  return {
    thumbnails,
    isGenerating,
    getThumbnail,
  };
};

export default useThumbnailGenerator;
