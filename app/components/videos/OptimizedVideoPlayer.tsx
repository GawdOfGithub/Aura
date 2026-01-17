import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface OptimizedVideoPlayerProps {
  source: string | number;
  isActive: boolean;
  style?: ViewStyle;
  showControls?: boolean;
  loop?: boolean;
  muted?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
  onReady?: () => void;
}

interface PlayPauseOverlayProps {
  isPlaying: boolean;
  onPress: () => void;
  visible: boolean;
}

const PlayPauseOverlay: React.FC<PlayPauseOverlayProps> = ({
  isPlaying,
  onPress,
  visible,
}) => {
  const opacity = useSharedValue(visible ? 0.3 : 0);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 200 });
  }, [visible, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.overlayContainer, animatedStyle]}>
      <Pressable style={styles.overlayPressable} onPress={onPress}>
        <View style={styles.playPauseButton}>
          <View
            style={isPlaying ? styles.pauseIconContainer : styles.playIcon}
          >
            {isPlaying ? (
              <>
                <View style={styles.pauseBar} />
                <View style={styles.pauseBar} />
              </>
            ) : null}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export const OptimizedVideoPlayer: React.FC<OptimizedVideoPlayerProps> = ({
  source,
  isActive,
  style,
  showControls = true,
  loop = true,
  muted = true,
  onPlay,
  onPause,
  onEnd,
  onReady,
}) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const hideOverlayTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasCalledOnReady = useRef(false);

  const player = useVideoPlayer(source, (p) => {
    p.loop = loop;
    p.muted = muted;
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

  useEffect(() => {
    const subscription = player.addListener("playToEnd", () => {
      onEnd?.();
    });
    return () => subscription.remove();
  }, [player, onEnd]);

  useEffect(() => {
    const subscription = player.addListener("statusChange", (payload) => {
      if (payload.status === "readyToPlay" && !hasCalledOnReady.current) {
        hasCalledOnReady.current = true;
        onReady?.();
      }
    });
    return () => subscription.remove();
  }, [player, onReady]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      player.pause();
      onPause?.();
    } else {
      player.play();
      onPlay?.();
    }
  }, [isPlaying, player, onPlay, onPause]);

  const handleVideoPress = useCallback(() => {
    if (!showControls) return;
    if (hideOverlayTimeout.current) {
      clearTimeout(hideOverlayTimeout.current);
    }
    setShowOverlay(true);
    hideOverlayTimeout.current = setTimeout(() => {
      setShowOverlay(false);
    }, 2000);
  }, [showControls]);

  useEffect(() => {
    return () => {
      if (hideOverlayTimeout.current) {
        clearTimeout(hideOverlayTimeout.current);
      }
    };
  }, []);

  return (
    <View style={[styles.container, style]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={handleVideoPress}>
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
        />
      </Pressable>

      {showControls && isActive && (
        <PlayPauseOverlay
          isPlaying={isPlaying}
          onPress={togglePlayPause}
          visible={showOverlay}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  placeholder: {
    backgroundColor: "#1a1a1a",
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  overlayPressable: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  playPauseButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: {
    width: 0,
    height: 0,
    marginLeft: 6,
    borderLeftWidth: 20,
    borderTopWidth: 12,
    borderBottomWidth: 12,
    borderLeftColor: "rgba(255, 255, 255, 0.9)",
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
  },
  pauseIconContainer: {
    flexDirection: "row",
    gap: 6,
  },
  pauseBar: {
    width: 6,
    height: 24,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 2,
  },
});

export default OptimizedVideoPlayer;
