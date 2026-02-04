import React, { useEffect, useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { CoverDotted } from "../../assets/images/svg";
import { AppBaseUser, VideoStatus } from "../../types";
import { scale } from "../../utility/responsive";
import AppVideoPlayer from "../videos/AppVideoPlayer";
import BlurredVideo from "../videos/BlurredVideo";
import PixelatedVideo from "../videos/PixelatedVideo";

import { useRelayState } from "@/app/hooks/useRelayState";
import { useGetCurrentUserInfoQuery } from "@/app/store/features/users/userApi";
import CountdownTimer from "../time/CountdownTimer";
import {
  renderSeenAvatars,
  renderUnseenAvatars,
} from "../user-dps/CoverDpHelper";

interface CoverProps {
  chatId: string;
  relayId: string;
  videoSource: any;
  thumbnailSource?: string;
  relayEndTime: string;
  newCount?: number;
  isActive?: boolean;
  isScrolling?: boolean;
  users: AppBaseUser[];
  videoStatus?: VideoStatus;
}

export const EmptyCover = ({}) => {
  return (
    <View style={styles.container}>
      <View style={styles.emptyStateContainer}>
        <View style={StyleSheet.absoluteFill}>
          <CoverDotted width={scale.m(320)} height={scale.m(320)} />
        </View>

        <View style={styles.silenceContainer}>
          <Text style={styles.timeLabelText}>22m</Text>
          <Text style={styles.subText}>of silence</Text>
        </View>

        <Text style={styles.startLineText}>Start a line</Text>
      </View>
    </View>
  );
};
export const Cover: React.FC<CoverProps> = ({
  chatId,
  relayId,
  videoSource,
  thumbnailSource,
  relayEndTime,
  newCount = 3,
  isActive = true,
  isScrolling = false,
  users = [],
  videoStatus = "seen", // TBD
}) => {
  const { currentUserId } = useGetCurrentUserInfoQuery(undefined, {
    selectFromResult: ({ data }) => ({
      currentUserId: data?.id,
    }),
  });
  const shouldShowVideo = isActive && !isScrolling;
  const relayState = useRelayState({
    chatId: chatId!,
    relayId,
    currentUserId,
  });
  const paused = useSharedValue(!shouldShowVideo);
  useEffect(() => {
    paused.value = !shouldShowVideo;
  }, [shouldShowVideo, paused]);

  const videoUri = useMemo(() => {
    if (typeof videoSource === "string") return videoSource;
    if (typeof videoSource === "number")
      return Image.resolveAssetSource(videoSource).uri;
    if (videoSource?.uri) return videoSource.uri;
    return "";
  }, [videoSource]);

  const badgeText = useMemo(
    () => (videoStatus == "unseen" ? `+${newCount}` : `${newCount}`),
    [videoStatus, newCount],
  );

  const badgeColors = useMemo(() => {
    const defaults = {
      bg: "transparent",
      text: "#FFFFFF",
      borderColor: "transparent",
      borderWidth: 0,
    };

    switch (relayState) {
      case "live":
        return {
          ...defaults,
          bg: "rgba(255, 87, 25, 1)",
          borderColor: videoStatus === "unseen" ? "#FFFFFF7A" : "transparent",
          borderWidth: videoStatus === "unseen" ? scale.m(1) : 0,
        };
      case "ended":
        if (videoStatus === "unseen") {
          return {
            ...defaults,
            borderColor: "rgba(255, 87, 25, 1)",
            borderWidth: scale.m(1),
            bg: "rgba(255, 87, 25, 1)",
          };
        }
        return {
          ...defaults,
          bg: "#FFFFFF",
          text: "#3F3F3F",
          borderColor: "rgba(255, 255, 255, 0.48)",
          borderWidth: scale.m(1),
        };
      case "missed":
        return {
          ...defaults,
          bg: "rgba(255, 87, 25, 1)",
          borderColor: "rgba(255, 255, 255, 0.48)",
          borderWidth: 1,
        };
      default:
        return defaults;
    }
  }, [relayState, videoStatus]);

  return (
    <View style={styles.container}>
      <View style={styles.videoCircle}>
        {videoStatus === "unseen" ? (
          <BlurredVideo
            source={videoUri}
            width={scale.m(343)}
            height={scale.m(343)}
            videoPaused={paused}
            isMuted={true}
            isLooped={true}
            style={[StyleSheet.absoluteFill, { zIndex: 0 }]}
          />
        ) : relayState === "missed" ? (
          <PixelatedVideo
            source={videoUri}
            width={scale.m(343)}
            height={scale.m(343)}
            videoPaused={paused}
            pixelSize={18}
            isMuted={true}
            isLooped={true}
            style={[StyleSheet.absoluteFill, { zIndex: 0 }]}
          />
        ) : (
          <>
            <AppVideoPlayer
              source={videoUri}
              thumbnailSource={thumbnailSource}
              shouldLoad={shouldShowVideo}
              shouldPlay={shouldShowVideo}
              loop={true}
              muted={true}
              style={StyleSheet.absoluteFillObject}
            />
          </>
        )}

        {videoStatus === "seen"
          ? renderSeenAvatars(users, {
              relayCount: newCount,
              relayEndTime,
              isActive,
              relayState,
            })
          : renderUnseenAvatars(users)}

        {videoStatus === "unseen" && (
          <View style={styles.footerOverlay}>
            <CountdownTimer
              relayEndTime={relayEndTime}
              isActive={isActive}
              relayState={relayState}
            />

            <View
              style={[
                styles.newBadge,
                {
                  backgroundColor: badgeColors.bg,
                  borderColor: badgeColors.borderColor,
                  borderWidth: badgeColors.borderWidth,
                },
              ]}
            >
              <Text style={[styles.newBadgeText, { color: badgeColors.text }]}>
                {badgeText}
              </Text>
            </View>
          </View>
        )}
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
    justifyContent: "center",
  },
  videoCircle: {
    width: scale.m(343),
    height: scale.m(343),
    borderRadius: scale.m(56),
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.16)",
    backgroundColor: "#1A1A1A",
    position: "relative",
  },
  footerOverlay: {
    position: "absolute",
    bottom: scale.m(16),
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale.m(16),
    zIndex: 10,
  },
  newBadge: {
    height: scale.v(48),
    width: scale.m(48),
    borderRadius: scale.m(68),
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  newBadgeText: {
    fontSize: scale.fontFixed(20),
    fontWeight: "700",
  },
  // --- EMPTY STATE STYLES ---
  emptyStateContainer: {
    width: scale.m(320),
    height: scale.m(320),
    alignItems: "center",
    justifyContent: "center",
  },
  silenceContainer: {
    position: "absolute",
    bottom: "50%",
    marginBottom: scale.v(78),
    alignItems: "center",
    width: "100%",
    zIndex: 6,
  },
  timeLabelText: {
    fontFamily: "SN Pro",
    fontWeight: "700",
    fontSize: scale.fontFixed(18),
    lineHeight: scale.fontFixed(18),
    letterSpacing: -0.03 * 18,
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.48)",
    zIndex: 6,
  },
  subText: {
    marginTop: scale.v(2),
    fontFamily: "SN Pro",
    fontWeight: "600",
    fontSize: scale.fontFixed(14),
    lineHeight: scale.fontFixed(20),
    letterSpacing: -0.03 * 14,
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.48)",
    zIndex: 6,
  },
  startLineText: {
    width: scale.m(171),
    textAlign: "center",
    fontFamily: "SN Pro",
    fontWeight: "700",
    fontSize: scale.fontFixed(32),
    lineHeight: scale.fontFixed(32),
    letterSpacing: -0.03 * 32,
    color: "rgba(255, 255, 255, 0.48)",
    zIndex: 5,
  },
});
