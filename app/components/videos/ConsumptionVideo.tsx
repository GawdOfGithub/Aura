import { DownArrowIcon } from "@/app/assets/images/svg";
import { MinimalVideoItem } from "@/app/types";
import { scale } from "@/app/utility/responsive";
import { formatTime12hWithDay } from "@/app/utility/timeFuctions";
import { getVideoHeightFromWidth } from "@/app/utility/videoSizeInfo";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import VideoOverlayText from "../text-components/VideoOverlayText";
import StaticTimeAgo from "../time/StaticTime";
import AppVideoPlayer from "./AppVideoPlayer";

interface ConsumptionVideoContainerProps {
  videoItem: MinimalVideoItem;
}
const { width, height } = Dimensions.get("window");
const ConsumptionVideoContainer = ({
  videoItem,
}: ConsumptionVideoContainerProps) => {
  return (
    <View style={styles.videoContainer}>
      <AppVideoPlayer
        source={videoItem.videoPath}
        style={StyleSheet.absoluteFillObject}
        shouldLoad={true}
        shouldPlay={false}
      />
      <View style={styles.videoLiveHeader}>
        <StaticTimeAgo
          relayState="live"
          inputTime="2026-01-14T11:33:20.482910Z"
        />
        <DownArrowIcon />
      </View>
      <View style={styles.videoSubHeader}>
        <VideoOverlayText text="Aditya" />
        <VideoOverlayText
          style={{ marginTop: scale.v(2) }}
          text={formatTime12hWithDay("2026-01-14T11:33:20.482910Z")}
        />
      </View>
    </View>
  );
};

export default ConsumptionVideoContainer;

const styles = StyleSheet.create({
  videoContainer: {
    height: getVideoHeightFromWidth(),
    width: "100%",
    paddingTop: scale.v(50),

    backgroundColor: "red",
  },
  videoLiveHeader: {
    height: scale.m(42),
    width: width,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale.h(16),
  },
  videoSubHeader: {
    marginTop: scale.v(6),
    paddingLeft: scale.h(16),
  },
});
