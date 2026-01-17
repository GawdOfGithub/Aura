import { useVideoPlayer } from "expo-video";
import { useEffect, useMemo, useRef, useState } from "react";
import { Image } from "react-native";

export interface VideoItem {
  id: string;
  videoUri: string | number;
}

interface UseVideoPreloaderOptions {
  videos: VideoItem[];
  currentIndex: number;
  isScrolling: boolean;
  lookahead?: number;
}

interface PreloadResult {
  preloadedIndices: number[];
  isPreloading: boolean;
}

const resolveVideoSource = (source: string | number): string => {
  if (typeof source === "number") {
    return Image.resolveAssetSource(source).uri;
  }
  return source;
};

export const useVideoPreloader = ({
  videos,
  currentIndex,
  isScrolling,
  lookahead = 2,
}: UseVideoPreloaderOptions): PreloadResult => {
  const [preloadedIndices, setPreloadedIndices] = useState<number[]>([]);
  const [isPreloading, setIsPreloading] = useState(false);
  const preloadedSet = useRef<Set<number>>(new Set());

  const nextIndices = useMemo(() => {
    if (videos.length === 0) return [];
    const indices: number[] = [];
    for (let i = 1; i <= lookahead; i++) {
      const nextIndex = (currentIndex + i) % videos.length;
      indices.push(nextIndex);
    }
    return indices;
  }, [currentIndex, videos.length, lookahead]);

  const nextVideoSource1 = nextIndices[0] !== undefined && videos[nextIndices[0]]?.videoUri
    ? resolveVideoSource(videos[nextIndices[0]].videoUri)
    : "";
    
  const nextVideoSource2 = nextIndices[1] !== undefined && videos[nextIndices[1]]?.videoUri
    ? resolveVideoSource(videos[nextIndices[1]].videoUri)
    : "";

  const preloadedPlayer1 = useVideoPlayer(nextVideoSource1, (player) => {
    player.muted = true;
    player.loop = false;
  });

  const preloadedPlayer2 = useVideoPlayer(nextVideoSource2, (player) => {
    player.muted = true;
    player.loop = false;
  });

  useEffect(() => {
    if (isScrolling || videos.length === 0 || nextIndices[0] === undefined) {
      return;
    }

    const targetIndex = nextIndices[0];
    if (preloadedSet.current.has(targetIndex)) {
      return;
    }

    setIsPreloading(true);

    const handleStatusChange = preloadedPlayer1.addListener(
      "statusChange",
      (payload) => {
        if (payload.status === "readyToPlay") {
          preloadedSet.current.add(targetIndex);
          setPreloadedIndices(Array.from(preloadedSet.current));
          setIsPreloading(false);
        }
      }
    );

    return () => {
      handleStatusChange.remove();
    };
  }, [currentIndex, nextIndices, isScrolling, videos.length, preloadedPlayer1]);

  useEffect(() => {
    if (isScrolling || videos.length === 0 || nextIndices[1] === undefined) {
      return;
    }

    const targetIndex = nextIndices[1];
    if (preloadedSet.current.has(targetIndex)) {
      return;
    }

    const handleStatusChange = preloadedPlayer2.addListener(
      "statusChange",
      (payload) => {
        if (payload.status === "readyToPlay") {
          preloadedSet.current.add(targetIndex);
          setPreloadedIndices(Array.from(preloadedSet.current));
        }
      }
    );

    return () => {
      handleStatusChange.remove();
    };
  }, [currentIndex, nextIndices, isScrolling, videos.length, preloadedPlayer2]);

  useEffect(() => {
    const validIndices = Array.from(preloadedSet.current).filter(
      (idx) => idx > currentIndex || (currentIndex > videos.length - lookahead && idx < lookahead)
    );
    if (validIndices.length !== preloadedSet.current.size) {
      preloadedSet.current = new Set(validIndices);
      setPreloadedIndices(validIndices);
    }
  }, [currentIndex, videos.length, lookahead]);

  return {
    preloadedIndices,
    isPreloading,
  };
};

export default useVideoPreloader;
