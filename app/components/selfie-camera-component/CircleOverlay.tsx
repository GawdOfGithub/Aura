import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, Mask, Rect } from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const CIRCLE_RADIUS = SCREEN_WIDTH * 0.4;
export const CIRCLE_CENTER_X = SCREEN_WIDTH / 2;
export const CIRCLE_CENTER_Y = SCREEN_HEIGHT * 0.4;
export const CIRCLE_BOUNDS = {
  centerX: CIRCLE_CENTER_X,
  centerY: CIRCLE_CENTER_Y,
  radius: CIRCLE_RADIUS,
};

interface CircleOverlayProps {
  isValid: boolean;
  message: string;
}

export const CircleOverlay: React.FC<CircleOverlayProps> = ({
  isValid,
  message,
}) => {
  const borderColor = isValid ? "#4ADE80" : "#EF4444";

  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT} style={styles.svg}>
        <Defs>
          <Mask id="mask">
            <Rect
              x="0"
              y="0"
              width={SCREEN_WIDTH}
              height={SCREEN_HEIGHT}
              fill="white"
            />
            <Circle
              cx={CIRCLE_CENTER_X}
              cy={CIRCLE_CENTER_Y}
              r={CIRCLE_RADIUS}
              fill="black"
            />
          </Mask>
        </Defs>
        <Rect
          x="0"
          y="0"
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
          fill="rgba(0, 0, 0, 1)"
          mask="url(#mask)"
        />
        <Circle
          cx={CIRCLE_CENTER_X}
          cy={CIRCLE_CENTER_Y}
          r={CIRCLE_RADIUS}
          fill="none"
          stroke={borderColor}
          strokeWidth={4}
        />
      </Svg>
      <View style={styles.messageContainer}>
        <Text style={[styles.message, { color: borderColor }]}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject },
  svg: { position: "absolute", top: 0, left: 0 },
  messageContainer: {
    position: "absolute",
    bottom: 200,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  message: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    overflow: "hidden",
  },
});

export default CircleOverlay;
