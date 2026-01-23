// Component to show Live or relay ended time

import { colors } from "@/app/theme";
import { RelayState } from "@/app/types";
import { scale } from "@/app/utility/responsive";
import { getElapsedTime } from "@/app/utility/timeFuctions";
import BlurView from "@sbaiahmed1/react-native-blur";
import React from "react";
import { StyleSheet } from "react-native";
import VideoOverlayText from "../text-components/VideoOverlayText";

const getColor = (relayState: RelayState) => {
  switch (relayState) {
    case "live":
      return { bg: colors["success"][0], text: colors["success"][90] };
    case "ended":
      return { bg: "rgba(0, 0, 0, 0.16)", text: "rgba(255, 255, 255, 1)" };
    case "missed":
      return { bg: "rgba(255, 59, 29, 0.16)", text: colors["primary"][50] };
    default:
      return { bg: "rgba(0, 0, 0, 0.16)", text: "rgba(255, 255, 255, 1)" };
  }
};

const StaticTimeAgo = ({
  inputTime,
  relayState,
}: {
  inputTime: string;
  relayState: RelayState;
}) => {
  const { bg: bgColor, text: textColor } = getColor(relayState);

  return (
    <BlurView overlayColor={bgColor} blurAmount={24} style={[styles.container]}>
      <VideoOverlayText
        style={{ color: textColor, fontSize: scale.f(20) }}
        text={getElapsedTime(inputTime, relayState)}
        showShadow={false}
      />
    </BlurView>
  );
};

export default StaticTimeAgo;

const styles = StyleSheet.create({
  container: {
    height: scale.m(32),
    paddingHorizontal: scale.m(6),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: scale.m(12),
  },
});
