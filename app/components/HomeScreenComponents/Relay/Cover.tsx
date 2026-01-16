import { ProgressiveBlurView } from "@sbaiahmed1/react-native-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useVideoPlayer, VideoView } from "expo-video";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { useVideoTimer } from "../../../hooks/useVideoTimer";
import { RelayState } from "../../../types";
import { scale } from "../../../utility/responsive";
import { getTimerStyles } from "./TimeStyles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const VideoPlayerView: React.FC<{ videoSource: any; style: any }> = ({
  videoSource,
  style,
}) => {
  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.muted = true;
  });

  React.useEffect(() => {
    player.play();
  }, [player]);

  return (
    <VideoView
      player={player}
      style={style}
      contentFit="cover"
      nativeControls={false}
    />
  );
};

type SubState = "seen" | "unseen";

interface User {
  id: string;
  name: string;
  dp: any; // ImageSourcePropType
}

interface CoverProps {
  videoSource: any;
  relayEndTime: string;
  newCount?: number;
  relayState?: RelayState;
  subState?: SubState;
  isActive?: boolean;
  isScrolling?: boolean;
  shouldBlur?: boolean;
  users: User[];
}

export const Cover: React.FC<CoverProps> = ({
  videoSource,
  relayEndTime,
  newCount = 3,
  relayState = "live",
  subState = "unseen",
  isActive = true,
  isScrolling = false,
  shouldBlur = false,
  users = [],
}) => {
  const isBlurred = subState === "unseen";
  const badgeText = React.useMemo(
    () => (subState === "unseen" ? `${newCount} New` : `${newCount} 🔥`),
    [subState, newCount]
  );

  const badgeColors = React.useMemo(() => {
    switch (relayState) {
      case "live":
        return {
          bg: "rgba(30, 230, 42, 0.15)",
          gradient: ["#5AE000", "#26C72F"],
          text: "#FFFFFF",
          ring: "#26C72F",
          borderColor: subState === "unseen" ? "#FFFFFF7A" : undefined,
          borderWidth: subState === "unseen" ? scale.m(1) : 0,
        };
      case "ended":
        return {
          bg: "#FFFFFF",
          gradient: ["#FFFFFF", "#D4D4D4"],
          text: "#3F3F3F",
          ring: "#FFFFFF",
          borderColor: "rgba(255, 255, 255, 0.48)",
          borderWidth: scale.m(1),
        };
      case "missed":
        return {
          bg: "#FF7D71",
          gradient: ["#FF7D71", "#F52816"],
          text: "#FFFFFF",
          ring: "#E53935",
          borderColor: "rgba(255, 255, 255, 0.48)",
          borderWidth: 1,
        };
    }
  }, [relayState, subState]);

  const shouldShowVideo = React.useMemo(
    () => isActive && !isScrolling,
    [isActive, isScrolling]
  );

  // Use the smart timer hook with dynamic update intervals
  const { displayText, isExpired } = useVideoTimer({
    relayEndTime,
    isActive,
    mainState: relayState,
  });

  const timerStyles = getTimerStyles(relayState, isExpired);
  return (
    <View style={styles.container}>
      <View
        style={[styles.timerBadge, { borderWidth: timerStyles.borderWidth }]}
      >
        {relayState === "live" ? (
          <ProgressiveBlurView
            blurType="light"
            blurAmount={20}
            style={[
              styles.timerBadgeBlur,
              { backgroundColor: timerStyles.backgroundColor },
            ]}
            overlayColor={timerStyles.overlayColor}
          >
            <Text
              style={[
                styles.timerText,
                {
                  color: timerStyles.textColor,
                  fontSize: timerStyles.fontSize,
                  fontWeight: timerStyles.fontWeight,
                  lineHeight: timerStyles.lineHeight,
                  fontFamily: "Inter",
                  textAlign: "center",
                },
              ]}
            >
              {displayText}
            </Text>
          </ProgressiveBlurView>
        ) : (
          <View
            style={[
              styles.timerBadgeBlur,
              { backgroundColor: timerStyles.backgroundColor },
            ]}
          >
            <Text
              style={[
                styles.timerText,
                {
                  color: timerStyles.textColor,
                  fontSize: timerStyles.fontSize,
                  fontWeight: timerStyles.fontWeight,
                  lineHeight: timerStyles.lineHeight,
                  fontFamily: "Inter",
                  textAlign: "center",
                },
              ]}
            >
              {displayText}
            </Text>
          </View>
        )}
      </View>
      <View style={[styles.videoCircle, { borderColor: badgeColors.ring }]}>
        <View style={styles.videoCircleInner}>
          {shouldShowVideo && (
            <VideoPlayerView videoSource={videoSource} style={styles.video} />
          )}

          {(relayState === "live" || relayState === "missed") && (
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: scale.v(172),

                opacity: 0.7,
              }}
            >
              <LinearGradient
                colors={
                  relayState === "live"
                    ? ["#5AE00000", "#5AE000"]
                    : ["rgba(255, 50, 32, 0)", "rgba(255, 50, 32, 1)"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </View>
          )}
        </View>
      </View>
      <View
        style={[
          styles.newBadge,
          badgeColors.borderColor
            ? {
                borderColor: badgeColors.borderColor,
                borderWidth: badgeColors.borderWidth,
              }
            : {},
        ]}
      >
        <View style={styles.newBadgeGradient}>
          {badgeColors.gradient ? (
            <LinearGradient
              colors={badgeColors.gradient as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: badgeColors.bg },
              ]}
            />
          )}
          <Text style={[styles.newBadgeText, { color: badgeColors.text }]}>
            {badgeText}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: scale.m(359),
    height: scale.v(376),
    alignItems: "center",
    alignSelf: "center",
  },
  timerBadge: {
    marginTop: 0,
    marginBottom: scale.v(20),
    minWidth: scale.m(75),
    height: scale.v(40),
    borderRadius: scale.m(12),
    overflow: "hidden",
    alignSelf: "center",
  },
  timerBadgeBlur: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(30, 230, 42, 0.15)",
    paddingHorizontal: scale.h(12), // Increased padding for breathing room
    paddingVertical: scale.v(4),
  },
  timerText: {
    fontSize: scale.fontFixed(20),
    lineHeight: scale.m(28),
    color: "#26C72F",
    fontWeight: "700",
  },
  videoCircle: {
    width: scale.m(320),
    height: scale.m(320),
    borderRadius: scale.m(200),
    overflow: "hidden",
    borderWidth: 4,
    borderColor: "#26C72F",
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
  },

  videoCircleInner: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    borderRadius: scale.m(200),
  },
  newBadge: {
    marginTop: scale.v(-14),
    alignSelf: "center",
    height: scale.v(28),
    borderRadius: scale.m(18),
    borderColor: "rgba(255, 255, 255, 0.8)",
    overflow: "hidden",
    zIndex: 10,
  },
  newBadgeGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scale.h(12),
  },
  newBadgeText: {
    fontSize: scale.fontFixed(14),
    lineHeight: scale.m(20),
    color: "#FFFFFF",
    fontWeight: "700",
  },
});


