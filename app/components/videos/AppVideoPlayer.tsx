import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
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
}

// 1. The Heavy Lifter: Manages the actual native player instance
const ActiveVideoComponent = ({
  source,
  shouldPlay,
  muted,
  loop,
  onEnd,
  onReady,
  onPlay,
  onPause,
}: Omit<AppVideoPlayerProps, "shouldLoad" | "style" | "thumbnailSource">) => {
  // Setup the player instance
  const player = useVideoPlayer(source, (p) => {
    p.loop = loop ?? false;
    p.muted = muted ?? false;
    // CRITICAL: We do NOT auto-play in the setup. We let the useEffect below handle it.
  });

  const { status } = useEvent(player, "statusChange", {
    status: player.status,
    isPlaying: player.playing,
  });

  // 2. Playback Control Logic
  // This reacts instantly when the user swipes to this video
  useEffect(() => {
    if (shouldPlay) {
      player.play();
    } else {
      player.pause();
      // Optional: specific seek to 0 if you want preloaded videos to always start fresh
      // player.currentTime = 0;
    }
  }, [shouldPlay, player]);

  // 3. Mute Management
  // Ensure preloaded videos are strictly muted until they become the active one
  useEffect(() => {
    player.muted = muted ?? false;
  }, [muted, player]);

  // 4. Event Listeners
  useEffect(() => {
    const endSub = player.addListener("playToEnd", () => onEnd?.());
    const playSub = player.addListener("playingChange", (playing) => {
      playing ? onPlay?.() : onPause?.();
    });

    return () => {
      endSub.remove();
      playSub.remove();
    };
  }, [player, onEnd, onPlay, onPause]);

  // Notify parent when video is buffered and ready
  useEffect(() => {
    if (status === "readyToPlay") {
      onReady?.();
    }
  }, [status, onReady]);

  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      nativeControls={false}
      // On Android, this helps with performance during list scrolling
      allowsFullscreen={false}
    />
  );
};

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
        {/* LAYER 1: The Video Player
         Mounted only if shouldLoad is true (Current OR Next Item)
      */}
        {shouldLoad && (
          <ActiveVideoComponent
            source={source}
            shouldPlay={shouldPlay}
            muted={muted}
            loop={loop}
            onEnd={onEnd}
            onPlay={onPlay}
            onPause={onPause}
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
         
         We use Absolute positioning to sit on top of the video container.
      */}
        {(!shouldLoad || !isVideoReady) && (
          <Animated.View
            entering={FadeIn.duration(200)}
            style={StyleSheet.absoluteFill}
            pointerEvents="none" // Let touches pass through to the video view if needed
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
