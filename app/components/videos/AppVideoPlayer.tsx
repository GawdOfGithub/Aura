import { useEvent } from "expo";
import {
  StatusChangeEventPayload,
  useVideoPlayer,
  VideoView,
} from "expo-video";
import React, { memo, useEffect, useState } from "react";
import { Image, StyleSheet, View, ViewStyle } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

interface AppVideoPlayerProps {
  source: string;
  thumbnailSource?: string;
  shouldLoad: boolean;
  shouldPlay: boolean;
  style?: ViewStyle;
  muted?: boolean;
  loop?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
  onReady?: () => void;
  // New Props
  onDuration?: (duration: number) => void;
  onProgress?: (currentTime: number) => void;
}

// 1. The Heavy Lifter: Manages the actual native player instance
const ActiveVideoComponent = memo(
  ({
    source,
    shouldPlay,
    muted,
    loop,
    onEnd,
    onReady,
    onPlay,
    onPause,
    onDuration,
    onProgress,
  }: Omit<AppVideoPlayerProps, "shouldLoad" | "style" | "thumbnailSource">) => {
    // Setup the player instance
    const player = useVideoPlayer(source, (p) => {
      p.loop = loop ?? false;
      p.muted = muted ?? false;
      p.timeUpdateEventInterval = 0.5;
      // CRITICAL: We do NOT auto-play in the setup. We let the useEffect below handle it.
    });

    const { status }: StatusChangeEventPayload = useEvent(
      player,
      "statusChange",
      {
        status: player.status,
        isPlaying: player.playing,
      },
    );

    // 2. Playback Control Logic
    // This reacts instantly when the user swipes to this video
    useEffect(() => {
      if (shouldPlay) {
        player.replay();
      } else {
        player.pause();
      }
    }, [shouldPlay, player]);

    useEffect(() => {
      player.muted = muted ?? false;
    }, [muted, player]);

    useEffect(() => {
      const endSub = player.addListener("playToEnd", () => onEnd?.());

      const playSub = player.addListener("playingChange", (isPlaying) => {
        isPlaying ? onPlay?.() : onPause?.();
      });
      const timeSub = player.addListener("timeUpdate", (event) => {
        onProgress?.(event.currentTime);
      });

      return () => {
        endSub.remove();
        playSub.remove();
        timeSub.remove();
      };
    }, [player, onEnd, onPlay, onPause, onProgress]);

    // Notify parent when video is buffered and ready
    useEffect(() => {
      if (status === "readyToPlay") {
        onReady?.();
      }
      if (player.duration > 0) {
        onDuration?.(player.duration);
      }
    }, [status, onReady, onDuration, player.duration]);

    return (
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        // On Android, this helps with performance during list scrolling
        fullscreenOptions={{ enable: false }}
      />
    );
  },
);

// 5. The Container: Handles the switching between Image and Video
export const AppVideoPlayer: React.FC<AppVideoPlayerProps> = memo(
  ({
    source,
    thumbnailSource,
    shouldLoad,
    shouldPlay,
    style,
    muted = false,
    loop = false,
    onPlay,
    onPause,
    onEnd,
    onReady,
    onDuration,
    onProgress,
  }) => {
    const [isVideoReady, setIsVideoReady] = useState(false);
    // If we unload the video (scroll far away), reset the ready state
    useEffect(() => {
      if (!shouldLoad) {
        setIsVideoReady(false);
      }
    }, [shouldLoad]);

    return (
      <View style={[styles.container, style]}>
        {shouldLoad && (
          <ActiveVideoComponent
            source={source}
            shouldPlay={shouldPlay}
            muted={muted}
            loop={loop}
            onEnd={onEnd}
            onPlay={onPlay}
            onPause={onPause}
            onDuration={onDuration}
            onProgress={onProgress}
            onReady={() => {
              setIsVideoReady(true);
              onReady?.();
            }}
          />
        )}

        {/* LAYER 2: The Thumbnail Image
         Visible if:
         1. Video is NOT meant to load (Far away items)
         2. OR Video IS loading but hasn't buffered yet (prevents black flash)
         
       Absolute positioning to sit on top of the video container.
      */}
        {(!shouldLoad || !isVideoReady) && (
          <Animated.View
            entering={FadeIn.duration(200)}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          >
            <Image
              source={{ uri: thumbnailSource }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          </Animated.View>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AppVideoPlayer;
