import { colors } from "@/app/theme";
import { scale } from "@/app/utility/responsive";
import React from "react";
import { StyleSheet, Text, TextStyle } from "react-native";

const VideoOverlayText = ({
  text,
  style,
  showShadow = true,
}: {
  text: string;
  style?: TextStyle;
  showShadow?: boolean;
}) => {
  return (
    <Text
      style={[
        {
          fontSize: scale.font(18),
          fontWeight: "800",
          color: colors["font"][0],
        },
        style,
        showShadow && {
          textShadowColor: "rgba(0,0,0,0.72)",
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 4,
        },
      ]}
    >
      {text}
    </Text>
  );
};

export default VideoOverlayText;

const styles = StyleSheet.create({});
